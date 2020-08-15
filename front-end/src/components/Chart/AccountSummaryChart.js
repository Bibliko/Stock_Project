import React from "react";
import Chart from "react-apexcharts";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../utils/DayTimeUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import {
  getCachedAccountSummaryChartInfo,
  parseRedisAccountSummaryChartItem,
} from "../../utils/RedisUtil";

import { withStyles, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
// import ImportExportRoundedIcon from '@material-ui/icons/ImportExportRounded';

const styles = (theme) => ({
  mainDiv: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    marginBottom: "10px",
    marginTop: "20px",
  },
  chart: {
    height: "100%",
    width: "100%",
    [theme.breakpoints.up("md")]: {
      height: "75%",
      width: "75%",
    },
  },
  note: {
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
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
          enabled: false,
        },
        toolbar: {
          show: true,
          offsetY: -50,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
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
            return new Date(val);
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

  intervalCheckThemeBreakpoints;
  intervalUpdateChartSeries;

  setStateChart = (
    enableSparkline,
    showLabelsXaxis,
    showLabelsYaxis,
    showComplexXaxisTooltipFormatter
  ) => {
    this.setState({
      options: {
        ...this.state.options,
        chart: {
          ...this.state.options.chart,
          sparkline: {
            enabled: enableSparkline,
          },
        },
        xaxis: {
          ...this.state.options.xaxis,
          labels: {
            ...this.state.options.xaxis.labels,
            show: showLabelsXaxis,
          },
          tooltip: {
            formatter: showComplexXaxisTooltipFormatter
              ? function (val, opts) {
                  return new Date(val);
                }
              : function (val, opt) {
                  return new Date(val).toLocaleTimeString();
                },
          },
        },
        yaxis: {
          ...this.state.options.yaxis,
          labels: {
            ...this.state.options.yaxis.labels,
            show: showLabelsYaxis,
          },
        },
      },
    });
  };

  checkThemeBreakpointsToChangeChart = () => {
    const { mediaQuery } = this.props;

    const isScreenSmall = mediaQuery;

    // mediaQuery in this case check if theme breakpoints is below sm (600px)
    if (!isScreenSmall && this.state.options.chart.sparkline.enabled) {
      this.setStateChart(false, true, true, true);
    }
    if (isScreenSmall && !this.state.options.chart.sparkline.enabled) {
      this.setStateChart(true, false, false, false);
    }
  };

  initializeOrUpdateChartSeries = () => {
    let seriesData = [];

    getCachedAccountSummaryChartInfo(this.props.email)
      .then((cachedTimestamp) => {
        const { data } = cachedTimestamp;
        if (data) {
          data.map((timestamp) => {
            return seriesData.push(
              parseRedisAccountSummaryChartItem(timestamp)
            );
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

    this.intervalCheckThemeBreakpoints = setInterval(
      () => this.checkThemeBreakpointsToChangeChart(),
      oneSecond
    );
    this.intervalUpdateChartSeries = setInterval(
      () => this.initializeOrUpdateChartSeries(),
      30 * oneSecond
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalCheckThemeBreakpoints);
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
            Chart is not updated yet. It's only updated whenever market is
            closed.
          </Typography>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(
  withTheme(
    withRouter(withMediaQuery("(max-width:600px)")(AccountSummaryChart))
  )
);
