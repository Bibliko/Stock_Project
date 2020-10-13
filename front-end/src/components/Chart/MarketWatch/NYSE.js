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
import {
  numberWithCommas,
  isNum,
} from "../../../utils/low-dependency/NumberUtil";

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
          autoSelected: "reset",
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
          formatter: (value) => {
            return this.xAxisFormatter(value, "labels");
          },
        },
        type: "category",
        tickAmount: 2,
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
          formatter: (value) => {
            return this.xAxisFormatter(value, "tooltip");
          },
        },
        y: {
          formatter: (value) => {
            return `$${numberWithCommas(value.toFixed(3))}`;
          },
        },
        fixed: {
          enabled: true,
          offsetY: -50,
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

    historicalChart5min: [],
    historicalChartFull: [],
    chartTimeLimitChoices: ["1D", "1W", "1M", "6M", "Full"],
    chartTimeLimit: "1D",
    isChartReady: false,
  };

  intervalUpdateChartSeries;
  intervalCheckBreakpoints;

  prevIsScreenSmall = this.props.mediaQuery;

  /**
   * @param {string} value string "date|chartTimeLimit" or numberic string (e.g: '79') showing index in seriesData (if xAxisType is tooltip)
   * @param {string} xAxisType tooltip or labels
   */
  xAxisFormatter = (value, xAxisType) => {
    const { data } = this.state.series[0];
    let valuesArray;

    if (!value) {
      return value;
    } else {
      if (!isNum(value)) {
        valuesArray = value.split("|");
      } else {
        if (!data[parseInt(value, 10) - 1]) return;
        valuesArray = data[parseInt(value, 10) - 1].x.split("|");
      }
    }

    const date = valuesArray[0];
    const chartTimeLimit = valuesArray[1];

    if (
      chartTimeLimit === "1M" ||
      chartTimeLimit === "6M" ||
      chartTimeLimit === "Full"
    ) {
      return new Date(date).toLocaleDateString();
    }

    if (xAxisType === "tooltip") {
      return new Date(date).toLocaleString();
    }

    if (chartTimeLimit === "1D") {
      return new Date(date).toLocaleTimeString();
    }

    if (chartTimeLimit === "1W") {
      const firstDataDate = new Date(
        data[0].x.split("|")[0]
      ).toLocaleDateString();

      const lastDataDate = new Date(
        data[data.length - 1].x.split("|")[0]
      ).toLocaleDateString();

      if (firstDataDate === lastDataDate) {
        return new Date(date).toLocaleTimeString();
      } else {
        return new Date(date).toLocaleDateString();
      }
    }
  };

  checkBreakpointsAndAdjustChart = () => {
    const { mediaQuery: isScreenSmall } = this.props;
    if (isScreenSmall !== this.prevIsScreenSmall) {
      this.prevIsScreenSmall = isScreenSmall;

      this.setState({
        options: {
          ...this.state.options,
          yaxis: {
            ...this.state.options.yaxis,
            show: !isScreenSmall,
            title: {
              ...this.state.options.yaxis.title,
              text: isScreenSmall ? undefined : "Close Price",
            },
          },
          xaxis: {
            ...this.state.options.xaxis,
            labels: {
              ...this.state.options.xaxis.labels,
              show: !isScreenSmall,
            },
          },
        },
      });
    }
  };

  chooseMinDate = (historicalChart) => {
    const { chartTimeLimit } = this.state;
    let minDate = new Date(historicalChart[0].date);

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
              series: [
                {
                  ...this.state.series[0],
                  data: seriesData,
                },
              ],
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

    const minDate = this.chooseMinDate(historicalChart);

    for (let i = historicalChart.length - 1; i >= 0; i--) {
      const { date, close } = historicalChart[i];

      if (new Date(date) >= minDate) {
        const chartItem = { x: `${date}|${chartTimeLimit}`, y: close };
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

  initializeAndCreateIntervalForChartSeries5min = () => {
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
    this.initializeAndCreateIntervalForChartSeries5min();

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

    const {
      options,
      series,
      isChartReady,
      chartTimeLimit,
      chartTimeLimitChoices,
    } = this.state;

    return (
      <div className={classes.mainDiv}>
        {!isChartReady && (
          <CircularProgress className={classes.circularProgress} />
        )}
        {isChartReady && isEmpty(series[0].data) && (
          <Typography className={classes.note}>No Data</Typography>
        )}
        <Chart
          type="area"
          series={series}
          options={options}
          className={classes.chart}
        />
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
