import React from "react";

import Highcharts from "highcharts";
import Boost from "highcharts/modules/boost";
import HighchartsReact from "highcharts-react-official";

import { DateTime } from "luxon";

import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";

import {
  oneMinute,
  oneSecond,
} from "../../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../../theme/ThemeUtil";
import { getCachedExchangeHistoricalChart } from "../../../utils/RedisUtil";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";

const styles = (theme) => ({
  mainDiv: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
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
  circularProgress: {
    position: "absolute",
    alignSelf: "center",
  },
});

Boost(Highcharts);

class NYSEMarketWatch extends React.Component {
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
        text: "NYSE Exchange",
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
    isChartReady: false,
  };

  intervalUpdateChartSeries;

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
    return new Promise((resolve, reject) => {
      Promise.all([
        getCachedExchangeHistoricalChart("NYSE", "5min"),
        getCachedExchangeHistoricalChart("NYSE", "full"),
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

  setStateChartAfterGettingInfoFromCache = (seriesData) => {
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
      // - 16:00:00 is the time when NYSE closes market
      const localTimestamp =
        date.length === 10
          ? DateTime.fromISO(date, { zone: "America/New_York" })
              .set({ hour: 16, minute: 0, second: 0 })
              .toMillis()
          : DateTime.fromFormat(date, "yyyy-MM-dd hh:mm:ss", {
              zone: "America/New_York",
            }).toMillis();

      if (localTimestamp >= minTimestamp) {
        const chartItem = [localTimestamp, close];
        seriesData.push(chartItem);
      }
    }

    this.setStateChartAfterGettingInfoFromCache(seriesData);
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

  initializeAndCreateIntervalForChartSeries = () => {
    clearInterval(this.intervalUpdateChartSeries);

    this.initializeHistoricalChartUsingDataFromCache()
      .then((done) => {
        this.intervalUpdateChartSeries = setInterval(() => {
          this.initializeHistoricalChartUsingDataFromCache();
        }, 5 * oneMinute);
      })
      .catch((err) => {
        console.log(err);
      });
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
    this.initializeAndCreateIntervalForChartSeries();
  }

  componentWillUnmount() {
    clearInterval(this.intervalUpdateChartSeries);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState, this.state);
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
          <CircularProgress className={classes.circularProgress} />
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

export default withStyles(styles)(
  withTheme(withRouter(withMediaQuery("(max-width:600px)")(NYSEMarketWatch)))
);
