import React from "react";
import PropTypes from "prop-types";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import Boost from "highcharts/modules/boost";
import BrokenAxis from "highcharts/modules/broken-axis";

import { DateTime } from "luxon";

import { isEmpty, isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { highChartDecorations } from "./HighChartOptions";

import { oneMinute, oneSecond } from "../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import { getCachedHistoricalChart } from "../../utils/RedisUtil";

import SegmentedBar from "../ProgressBar/SegmentedBar";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";

const styles = (theme) => ({
  mainDiv: {
    height: "100%",
    minHeight: "400px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
  },
  chart: {
    width: "100%",
    maxWidth: "600px",
  },
  note: {
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    alignSelf: "center",
  },
  toggleButton: {
    "&.MuiToggleButton-root": {
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      "&.Mui-selected": {
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.hover,
      },
      "&:hover": {
        backgroundColor: theme.palette.primary.hover,
      },
    },
  },
  segmentedBar: {
    position: "absolute",
    left: "calc((100% - 100px) / 2)", // default width of segmented bar
    top: "calc((100% - 20px) / 2)", // default height of segmented bar
  },
});

Boost(Highcharts);
BrokenAxis(Highcharts);

class ExchangeOrCompanyPriceChart extends React.Component {
  state = {
    highChartOptions: {
      ...highChartDecorations,

      yAxis: {
        ...highChartDecorations.yAxis,
        title: {
          ...highChartDecorations.yAxis.title,
        },
      },

      series: [
        {
          ...highChartDecorations.series[0],
          name: "Close Price",
          data: [],
        },
      ],
    },

    historicalChart5min: [],
    historicalChartFull: [],
    chartTimeLimitChoices: ["1D", "1W", "1M", "6M", "Full"],
    chartTimeLimit: "1D",
    isChartReady: false,
  };

  intervalUpdateChart;

  /**
   * @returns {Date} Min Date
   * - Min date according to the chosen chartTimeLimit (1D, 1W, 1M, 6M, or Full)
   * - The chart to draw from that date
   * @param {Array} historicalChart Array of historical chart information obtained from FMP
   */
  chooseMinDate = (historicalChart) => {
    const { chartTimeLimit } = this.state;

    // standard here means fitting all browsers (Safari, Chrome, Firefox): '2020/10/20'
    const datePieces = historicalChart[0].date.split("-");
    const standardFormDate = datePieces.join("/");
    let minDate = new Date(standardFormDate);

    if (chartTimeLimit === "Full") {
      minDate.setFullYear(0);
      return minDate;
    }

    if (chartTimeLimit === "1D") {
      minDate.setHours(0, 0, 0, 0);
      return minDate;
    }

    if (chartTimeLimit === "1W") {
      minDate.setDate(minDate.getDate() - minDate.getDay());
      minDate.setHours(0, 0, 0, 0);
      return minDate;
    }

    // 1M or 6M
    const offset = chartTimeLimit === "1M" ? 1 : 6;
    minDate.setMonth(minDate.getMonth() - offset);
    minDate.setDate(1);
    minDate.setHours(0, 0, 0, 0);
    return minDate;
  };

  updateHistoricalChartUsingDataFromCache = () => {
    const { exchangeOrCompany } = this.props;

    return new Promise((resolve, reject) => {
      Promise.all([
        getCachedHistoricalChart(exchangeOrCompany, "5min"),
        getCachedHistoricalChart(exchangeOrCompany, "full"),
      ])
        .then(([historicalChart5min, historicalChartFull]) => {
          if (
            !isEqual(historicalChart5min, this.state.historicalChart5min) ||
            !isEqual(historicalChartFull, this.state.historicalChartFull)
          ) {
            this.setState(
              {
                historicalChart5min,
                historicalChartFull,
              },
              () => {
                this.updateChartSeriesBasedOnState();
                resolve("Done");
              }
            );
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  setStateChartAfterGettingInfoFromCache = (seriesData, xAxisBreaks) => {
    this.setState(
      {
        isChartReady: false,
      },
      () => {
        setTimeout(() => {
          this.setState(
            {
              highChartOptions: {
                ...this.state.highChartOptions,
                xAxis: {
                  ...this.state.highChartOptions.xAxis,
                  breaks: xAxisBreaks,
                },
                series: [
                  {
                    ...this.state.highChartOptions.series[0],
                    data: seriesData,
                  },
                ],
              },
            },
            () => {
              setTimeout(() => {
                this.setState({
                  isChartReady: true,
                });
              }, oneSecond / 2);
            }
          );
        }, oneSecond / 2);
      }
    );
  };

  updateChartSeriesBasedOnState = () => {
    const {
      chartTimeLimit,
      historicalChart5min,
      historicalChartFull,
    } = this.state;

    let seriesData = [];

    // highcharts xAxis.breaks
    let xAxisBreaks = [];

    // Choose historical chart information that fits in with chartTimeLimit
    const historicalChart =
      chartTimeLimit === "1D" || chartTimeLimit === "1W"
        ? historicalChart5min
        : historicalChartFull;

    // Choose min timestampt that chart starts to draw from
    const minTimestamp = DateTime.fromJSDate(
      this.chooseMinDate(historicalChart),
      {
        zone: "America/New_York",
      }
    ).toMillis();

    // Loop from the end of historicalChart since historicalChart is arranged descendingly.
    for (
      let i = historicalChart.length - 1;
      i >= 0;
      i -= chartTimeLimit === "1D" ? 1 : 2
    ) {
      const { date, close } = historicalChart[i];

      // - length === 10 when '2020-10-20' without time following after
      // - 16:00:00 is the time when NYSE and NASDAQ closes market
      const timestampItem =
        date.length === 10
          ? DateTime.fromISO(date, { zone: "America/New_York" })
              .set({ hour: 16, minute: 0, second: 0 })
              .toMillis()
          : DateTime.fromFormat(date, "yyyy-MM-dd hh:mm:ss", {
              zone: "America/New_York",
            }).toMillis();

      // If larger than min timestamp, then the chart needs to draw this timestampItem.
      if (timestampItem >= minTimestamp) {
        // - There are huge gaps between the closure time from the last day and open time of next day
        // - To erase the gap, create a xAxisBreaks array for Highcharts
        if (seriesData.length > 0 && chartTimeLimit === "1W") {
          const latestItemInSeriesData = seriesData[seriesData.length - 1][0];

          if (timestampItem > latestItemInSeriesData + 10 * oneMinute) {
            xAxisBreaks.push({
              from: latestItemInSeriesData,
              to: timestampItem,
              breakSize: 10 * oneMinute,
            });
          }
        }

        const chartItem = [
          timestampItem,
          Math.round((close + Number.EPSILON) * 100) / 100,
        ];
        seriesData.push(chartItem);
      }
    }

    console.log();
    this.setStateChartAfterGettingInfoFromCache(seriesData, xAxisBreaks);
  };

  onChangeChartTimeLimit = (event, newValue) => {
    if (newValue) {
      this.setState(
        {
          chartTimeLimit: newValue,
        },
        () => {
          this.updateChartSeriesBasedOnState();
        }
      );
    }
  };

  helperToggleButtonComponent = (choice, classes) => {
    return (
      <ToggleButton
        key={choice}
        value={choice}
        className={classes.toggleButton}
      >
        {choice}
      </ToggleButton>
    );
  };

  componentDidMount() {
    this.updateHistoricalChartUsingDataFromCache()
      .then(() => {
        this.intervalUpdateChart = setInterval(
          () => this.updateHistoricalChartUsingDataFromCache(),
          oneMinute
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(this.props.exchangeOrCompany, prevProps.exchangeOrCompany)) {
      this.updateHistoricalChartUsingDataFromCache().catch((err) =>
        console.log(err)
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalUpdateChart);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "exchangeOrCompany"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    const {
      isChartReady,
      chartTimeLimit,
      chartTimeLimitChoices,
      highChartOptions,
    } = this.state;

    return (
      <div className={classes.mainDiv}>
        {!isChartReady && (
          <div
            style={{
              height: "400px",
              width: "100%",
              position: "relative",
            }}
          >
            <SegmentedBar className={classes.segmentedBar} />
          </div>
        )}

        {isChartReady && isEmpty(highChartOptions.series[0].data) && (
          <Typography className={classes.note}>No Data</Typography>
        )}

        {isChartReady && !isEmpty(highChartOptions.series[0].data) && (
          <HighchartsReact
            containerProps={{
              style: {
                width: "100%",
                maxWidth: "600px",
              },
            }}
            highcharts={Highcharts}
            options={highChartOptions}
          />
        )}

        <ToggleButtonGroup
          value={chartTimeLimit}
          exclusive
          onChange={this.onChangeChartTimeLimit}
        >
          {chartTimeLimitChoices.map((choice) =>
            this.helperToggleButtonComponent(choice, classes)
          )}
        </ToggleButtonGroup>
      </div>
    );
  }
}

ExchangeOrCompanyPriceChart.propTypes = {
  classes: PropTypes.object.isRequired,
  exchangeOrCompany: PropTypes.string.isRequired,
};

export default withStyles(styles)(
  withTheme(
    withRouter(withMediaQuery("(max-width:600px)")(ExchangeOrCompanyPriceChart))
  )
);
