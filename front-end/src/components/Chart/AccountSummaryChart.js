import React from "react";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";

import Highcharts from "highcharts";
import Boost from "highcharts/modules/boost";
import HighchartsReact from "highcharts-react-official";

import { oneMinute } from "../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import { getCachedAccountSummaryChartInfo } from "../../utils/RedisUtil";
import { parseRedisAccountSummaryChartItem } from "../../utils/low-dependency/ParserUtil";

import SegmentedBar from "../ProgressBar/SegmentedBar";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const styles = (theme) => ({
  mainDiv: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: "10px",
    marginTop: "20px",
  },
  chart: {
    width: "100%",
    maxWidth: "500px",
  },
  note: {
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    alignSelf: "center",
  },
  noteChart: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    color: "white",
    alignSelf: "center",
    marginTop: "16px",
  },
  noteChartSmaller: {
    fontSize: "small",
    [theme.breakpoints.down("xs")]: {
      fontSize: "smaller",
    },
    color: "white",
    alignSelf: "center",
    textAlign: "center",
    marginTop: "5px",
    fontStyle: "italic",
  },
});

Boost(Highcharts);

class AccountSummaryChart extends React.Component {
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
        text: "Historical Portfolio",
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
          text: "Portfolio Value",
          style: {
            color: "white",
          },
        },
      },

      series: [
        {
          type: "area",
          name: "Portfolio Value",
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

    isChartReady: false,
  };

  intervalUpdateChartSeries;

  initializeOrUpdateChartSeries = () => {
    let seriesData = [];

    getCachedAccountSummaryChartInfo(this.props.email)
      .then((cachedTimestamp) => {
        const { data } = cachedTimestamp;
        if (data) {
          data.forEach((timestamp) => {
            const parsedChartItem = parseRedisAccountSummaryChartItem(
              timestamp
            );

            // eliminate cases that value of timestamp is null
            if (parsedChartItem[0]) {
              seriesData.push([
                new Date(parsedChartItem[0]).getTime(),
                parseFloat(parsedChartItem[1]),
              ]);
            }
          });
        }

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
            if (!this.state.isChartReady) {
              this.setState({
                isChartReady: true,
              });
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidMount() {
    this.initializeOrUpdateChartSeries();

    this.intervalUpdateChartSeries = setInterval(
      () => this.initializeOrUpdateChartSeries(),
      oneMinute
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalUpdateChartSeries);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.email, this.props.email) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    const { highChartOptions, isChartReady } = this.state;

    return (
      <div className={classes.mainDiv}>
        {!isChartReady && <SegmentedBar />}
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
        {isChartReady && isEmpty(highChartOptions.series[0].data) && (
          <Typography className={classes.note}>
            The chart will be updated every minute.
          </Typography>
        )}
        <Typography className={classes.noteChart}>2-year records</Typography>
        <Typography className={classes.noteChartSmaller}>
          (If you need longer-than-2-year records, contact us...)
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(
  withTheme(
    withRouter(withMediaQuery("(max-width:600px)")(AccountSummaryChart))
  )
);
