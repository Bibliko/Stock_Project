import React from "react";
import PropTypes from "prop-types";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import Boost from "highcharts/modules/boost";
import BrokenAxis from "highcharts/modules/broken-axis";

import { DateTime } from "luxon";

import { isEmpty, isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { socket } from "../../App";

import { oneMinute, oneSecond } from "../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import { getCachedExchangeHistoricalChart } from "../../utils/RedisUtil";
import { getGlobalBackendVariablesFlags } from "../../utils/BackendUtil";
import {
  offSocketListeners,
  checkSocketUpdatedExchangeHistoricalChartFlags,
  updatedExchangeHistoricalChartFlags,
} from "../../utils/SocketUtil";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";

const styles = (theme) => ({
  mainDiv: {
    height: "100%",
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
      color: "rgba(255, 255, 255, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      "&.Mui-selected": {
        color: "rgba(255, 255, 255, 0.8)",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.4)",
      },
    },
  },
});

Boost(Highcharts);
BrokenAxis(Highcharts);

class MarketWatch extends React.Component {
  state = {
    highChartOptions: {
      chart: {
        zoomType: "x",
        backgroundColor: "rgba(255, 255, 255, 0)",
        style: {
          color: "white",
        },
      },

      title: {
        text: "NYSE Composite",
        style: {
          color: "white",
        },
      },

      subtitle: {
        text: "Note: DRAG to zoom (on web only)",
        style: {
          color: "white",
        },
      },

      legend: {
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
        borderColor: "white",
        itemHiddenStyle: {
          color: "white",
        },
        itemHoverStyle: {
          color: "#2196f3",
        },
        itemStyle: {
          color: "#2196f3",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          textOverflow: "ellipsis",
        },
      },

      xAxis: {
        labels: {
          enabled: true,
          style: {
            color: "white",
          },
        },
        breaks: {},
        type: "datetime",
      },

      yAxis: {
        labels: {
          enabled: true,
          style: {
            color: "white",
          },
        },
        allowDecimals: false,
        title: {
          text: "Close Price",
          style: {
            color: "white",
          },
        },
      },

      series: [
        {
          type: "area",
          name: "Close Price",
          data: [],
        },
      ],

      time: {
        useUTC: false,
      },

      plotOptions: {
        series: {
          boostThreshold: 2000,
          turboThreshold: 5000,
        },

        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, "rgba(33, 150, 243, 0.1)"],
              [1, "rgba(33, 150, 243, 0.5)"],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
      },

      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 400,
            },
            chartOptions: {
              yAxis: {
                labels: {
                  enabled: false,
                },
                title: {
                  text: null,
                },
              },
              subtitle: {
                text: null,
              },
              credits: {
                enabled: false,
              },
            },
          },
        ],
      },
    },

    historicalChart5min: [],
    historicalChartFull: [],
    chartTimeLimitChoices: ["1D", "1W", "1M", "6M", "Full"],
    chartTimeLimit: "1D",
    updatedExchangeHistoricalChart5minFlag: false,
    updatedExchangeHistoricalChartFullFlag: false,
    isChartReady: false,
  };

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

  initializeHistoricalChartUsingDataFromCache = () => {
    const { exchange } = this.props;

    return new Promise((resolve, reject) => {
      Promise.all([
        getCachedExchangeHistoricalChart(exchange, "5min"),
        getCachedExchangeHistoricalChart(exchange, "full"),
      ])
        .then(([historicalChart5min, historicalChartFull]) => {
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
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  setStateChartAfterGettingInfoFromCache = (seriesData, xAxisBreaks) => {
    const { exchange } = this.props;
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
                title: {
                  ...this.state.highChartOptions.title,
                  text: `${exchange} Composite`,
                },
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

    const historicalChart =
      chartTimeLimit === "1D" || chartTimeLimit === "1W"
        ? historicalChart5min
        : historicalChartFull;

    const minTimestamp = DateTime.fromJSDate(
      this.chooseMinDate(historicalChart),
      {
        zone: "America/New_York",
      }
    ).toMillis();

    for (let i = historicalChart.length - 1; i >= 0; i--) {
      const { date, close } = historicalChart[i];

      // - length === 10 when '2020-10-20' without time following after
      // - 16:00:00 is the time when NYSE and NASDAQ closes market
      const localTimestamp =
        date.length === 10
          ? DateTime.fromISO(date, { zone: "America/New_York" })
              .set({ hour: 16, minute: 0, second: 0 })
              .toMillis()
          : DateTime.fromFormat(date, "yyyy-MM-dd hh:mm:ss", {
              zone: "America/New_York",
            }).toMillis();

      if (localTimestamp >= minTimestamp) {
        if (seriesData.length > 0 && chartTimeLimit === "1W") {
          const latestItemInSeriesData = seriesData[seriesData.length - 1][0];

          if (localTimestamp > latestItemInSeriesData + 5 * oneMinute) {
            xAxisBreaks.push({
              from: latestItemInSeriesData,
              to: localTimestamp,
              breakSize: 5 * oneMinute,
            });
          }
        }
        const chartItem = [localTimestamp, close];
        seriesData.push(chartItem);
      }
    }

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

  setupMarketWatchChart = () => {
    const { exchange } = this.props;

    Promise.all([
      this.initializeHistoricalChartUsingDataFromCache(),
      getGlobalBackendVariablesFlags(),
    ])
      .then(([done, flags]) => {
        const {
          updatedExchangeHistoricalChart5minFlag,
          updatedExchangeHistoricalChartFullFlag,
        } = flags[exchange];
        this.setState(
          {
            updatedExchangeHistoricalChart5minFlag,
            updatedExchangeHistoricalChartFullFlag,
          },
          () => {
            checkSocketUpdatedExchangeHistoricalChartFlags(
              socket,
              this
            );
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidMount() {
    this.setupMarketWatchChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(this.props.exchange, prevProps.exchange)) {
      this.setupMarketWatchChart();
    }
  }

  componentWillUnmount() {
    offSocketListeners(socket, updatedExchangeHistoricalChartFlags);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["exchange"];
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
        {!isChartReady && <CircularProgress />}
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

MarketWatch.propTypes = {
  classes: PropTypes.object.isRequired,
  exchange: PropTypes.string.isRequired,
};

export default withStyles(styles)(
  withTheme(withRouter(withMediaQuery("(max-width:600px)")(MarketWatch)))
);
