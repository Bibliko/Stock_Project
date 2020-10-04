import React from "react";
import Chart from "react-apexcharts";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import { getCachedAccountSummaryChartInfo } from "../../utils/RedisUtil";
import { parseRedisAccountSummaryChartItem } from "../../utils/low-dependency/ParserUtil";
import { numberWithCommas } from "../../utils/low-dependency/NumberUtil";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Typography, CircularProgress } from "@material-ui/core";

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
    height: "auto",
    width: "75%",
    [theme.breakpoints.up("md")]: {
      width: "60%",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
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

class AccountSummaryChart extends React.Component {
  state = {
    options: {
      chart: {
        id: "AccountSummaryChart",
        sparkline: {
          enabled: false,
        },
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          offsetY: -50,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: true,
            customIcons: [],
          },
          export: {
            csv: {
              dateFormatter(timestamp) {
                return new Date(timestamp).toLocaleString();
              },
            },
          },
          autoSelected: "selection",
        },
        type: "area",
      },
      xaxis: {
        labels: {
          show: true,
          style: {
            colors: "white",
          },
          datetimeUTC: false,
        },
        type: "datetime",
        tickAmount: 6,
        tooltip: {
          formatter: function (val, opts) {
            return new Date(val).toLocaleTimeString();
          },
        },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            colors: "white",
          },
        },
        title: {
          text: "Portfolio Value",
          style: {
            fontSize: "14px",
            color: "white",
          },
        },
      },
      tooltip: {
        x: {
          format: "dd MMM yyyy",
        },
        y: {
          formatter: function (val, opts) {
            return `$${numberWithCommas(val)}`;
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      grid: {
        show: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 0.7,
          opacityFrom: 0.8,
          opacityTo: 0.4,
          stops: [0, 100],
        },
      },
    },

    series: [
      {
        name: "Total Portfolio",
        type: "area",
        data: [],
      },
    ],

    isChartReady: false,
  };

  intervalUpdateChartSeries;

  initializeOrUpdateChartSeries = () => {
    let seriesData = [];

    getCachedAccountSummaryChartInfo(this.props.email)
      .then((cachedTimestamp) => {
        const { data } = cachedTimestamp;
        if (data) {
          data.map((timestamp) => {
            const parsedChartItem = parseRedisAccountSummaryChartItem(
              timestamp
            );

            // eliminate cases that value of timestamp is null
            if (parsedChartItem[1]) {
              return seriesData.push(
                parseRedisAccountSummaryChartItem(timestamp)
              );
            }
            return "dummy value";
          });
        }

        this.setState(
          {
            series: [
              {
                ...this.state.series[0],
                data: seriesData,
              },
            ],
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
      30 * oneSecond
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

    const { options, series, isChartReady } = this.state;

    return (
      <div className={classes.mainDiv}>
        {!isChartReady && <CircularProgress />}
        {isChartReady && !isEmpty(series[0].data) && (
          <Chart options={options} series={series} className={classes.chart} />
        )}
        {isChartReady && isEmpty(series[0].data) && (
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
