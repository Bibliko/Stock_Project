import React from "react";
import Chart from "react-apexcharts";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";

import {
  oneMinute,
  oneSecond,
} from "../../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../../theme/ThemeUtil";
import { getCachedExchangeHistoricalChart } from "../../../utils/RedisUtil";
import { numberWithCommas } from "../../../utils/low-dependency/NumberUtil";

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
});

class NYSEMarketWatch extends React.Component {
  state = {
    options: {
      chart: {
        id: "NYSEMarketWatch",
        sparkline: {
          enabled: false,
        },
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
        type: "area",
      },
      stroke: {
        width: 2,
        curve: "straight",
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
        tickAmount: 3,
        labels: {
          show: true,
          style: {
            colors: "white",
          },
          formatter: (value) => {
            return parseInt(value, 10);
          },
        },
        title: {
          text: "Close Price",
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
        name: "Close Price",
        type: "area",
        data: [],
      },
    ],

    chartTimeLimit: "1D",
    isChartReady: false,
  };

  intervalUpdateChartSeries;
  intervalCheckBreakpoints;

  prevIsScreenSmall = this.props.mediaQuery;

  checkBreakpointsAndAdjustChart = () => {
    const { mediaQuery: isScreenSmall } = this.props;
    if (isScreenSmall !== this.prevIsScreenSmall) {
      this.prevIsScreenSmall = isScreenSmall;

      this.setState({
        options: {
          ...this.state.options,
          yaxis: {
            ...this.state.options.yaxis,
            labels: {
              ...this.state.options.yaxis.labels,
              show: isScreenSmall ? false : true,
            },
            title: {
              ...this.state.options.yaxis.title,
              text: isScreenSmall ? undefined : "Close Price",
            },
          },
        },
      });
    }
  };

  chooseMinDate = (historicalChart) => {
    const { chartTimeLimit } = this.state;
    let minDate = new Date(historicalChart[0].date);
    minDate.setHours(0, 0, 0, 0);

    if (chartTimeLimit === "1D") {
      return minDate;
    }
    if (chartTimeLimit === "1W") {
      minDate.setDate(minDate.getDate() - minDate.getDay());
      minDate.setHours(0, 0, 0, 0);
      return minDate;
    }
  };

  initializeOrUpdateChartSeriesForShortPeriod = () => {
    const { chartTimeLimit } = this.state;
    if (chartTimeLimit !== "1D" && chartTimeLimit !== "1W") {
      clearInterval(this.intervalUpdateChartSeries);
      return;
    }

    let seriesData = [];

    getCachedExchangeHistoricalChart("NYSE")
      .then((historicalChart) => {
        const minDate = this.chooseMinDate(historicalChart);

        historicalChart.forEach((timestamp) => {
          const { date, close } = timestamp;
          if (new Date(date) < minDate) {
            return;
          }
          const chartItem = [date, close];
          seriesData.push(chartItem);
        });

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

  onChangeChartTimeLimit = (event, newValue) => {
    this.setState(
      {
        chartTimeLimit: newValue,
      },
      () => {
        this.initializeOrUpdateChartSeriesForShortPeriod();
      }
    );
  };

  componentDidMount() {
    this.initializeOrUpdateChartSeriesForShortPeriod();

    this.intervalUpdateChartSeries = setInterval(() => {
      this.initializeOrUpdateChartSeriesForShortPeriod();
    }, 5 * oneMinute);

    this.intervalCheckBreakpoints = setInterval(
      () => this.checkBreakpointsAndAdjustChart(),
      oneSecond
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalUpdateChartSeries);
    clearInterval(this.intervalCheckBreakpoints);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState, this.state);
  }

  render() {
    const { classes } = this.props;

    const { options, series, isChartReady, chartTimeLimit } = this.state;

    return (
      <div className={classes.mainDiv}>
        {!isChartReady && <CircularProgress />}
        {isChartReady && !isEmpty(series[0].data) && (
          <Chart
            type="area"
            series={series}
            options={options}
            className={classes.chart}
          />
        )}
        {isChartReady && isEmpty(series[0].data) && (
          <Typography className={classes.note}>
            The chart will be updated every 5 minutes.
          </Typography>
        )}
        <ToggleButtonGroup
          value={chartTimeLimit}
          exclusive
          onChange={this.onChangeChartTimeLimit}
        >
          <ToggleButton value="1D" className={classes.toggleButton}>
            1D
          </ToggleButton>
          <ToggleButton value="1W" className={classes.toggleButton}>
            1W
          </ToggleButton>
          <ToggleButton value="1M" className={classes.toggleButton}>
            1M
          </ToggleButton>
          <ToggleButton value="6M" className={classes.toggleButton}>
            6M
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  }
}

export default withStyles(styles)(
  withTheme(withRouter(withMediaQuery("(max-width:600px)")(NYSEMarketWatch)))
);
