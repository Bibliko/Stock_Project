import React from "react";
import PropTypes from "prop-types";
import { isEmpty, isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import Highcharts from "highcharts";
import Boost from "highcharts/modules/boost";
import HighchartsReact from "highcharts-react-official";

import { highChartDecorations } from "./HighChartOptions";

import { oneMinute } from "../../utils/low-dependency/DayTimeUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import { getCachedAccountSummaryChartInfo } from "../../utils/RedisUtil";

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
      ...highChartDecorations,

      series: [
        {
          ...highChartDecorations.series[0],
          name: "Portfolio Value",
          data: [],
        },
      ],
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
            // eliminate cases that value of timestamp is null
            if (timestamp[0]) {
              seriesData.push([
                new Date(timestamp[0]).getTime(),
                parseFloat(timestamp[1]),
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
    const compareKeys = ["classes", "email"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, hasFinishedSettingUp } = this.props;

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
            {hasFinishedSettingUp
              ? "The chart will be updated every minute"
              : "Finish setting up your account first!"}
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

AccountSummaryChart.propTypes = {
  classes: PropTypes.object.isRequired,
  email: PropTypes.string.isRequired,
  hasFinishedSettingUp: PropTypes.bool.isRequired,
};

export default withStyles(styles)(
  withTheme(
    withRouter(withMediaQuery("(max-width:600px)")(AccountSummaryChart))
  )
);
