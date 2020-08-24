import React from "react";
import { withRouter } from "react-router";
import { isEmpty } from "lodash";
import { connect } from "react-redux";
import { userAction, marketAction } from "../../redux/storeActions/actions";

import { socket } from "../../App";
import { mainSetup } from "./setupForCachingInLayout";

import {
  shouldRedirectToLogin,
  redirectToPage,
} from "../../utils/PageRedirectUtil";

import {
  marketCountdownUpdate,
  oneSecond,
  oneMinute,
  convertToLocalTimeString,
  newDate,
} from "../../utils/DayTimeUtil";

import {
  checkMarketClosed,
  socketCheckMarketClosed,
  offSocketListeners,
} from "../../utils/SocketUtil";

import { updateCachedAccountSummaryChartInfoOneItem } from "../../utils/RedisUtil";

import AppBar from "./AppBar";
import Reminder from "../Reminder/Reminder";
import LayoutSpeedDial from "../SpeedDial/LayoutSpeedDial";

import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import Skeleton from "@material-ui/lab/Skeleton";

const styles = (theme) => ({
  root: {
    display: "flex",
  },
  //content. Write new CSS above this comment
  main: {
    position: "static",
    width: "100vw",
  },
  mainContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
  },
  contentHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    minHeight: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      minHeight: theme.customHeight.appBarHeightSmall,
    },
    justifyContent: "flex-start",
  },
  mainBackground: {
    backgroundColor: theme.palette.backgroundBlue.main,
    [theme.breakpoints.down("xs")]: {
      background: theme.palette.paperBackground.gradient,
    },
    backgroundSize: "cover",
    height: "100vh",
    width: "100%",
    position: "fixed",
  },
  secondBackground: {
    background: "#180B66",
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    backgroundSize: "cover",
    height: "100vh",
    width: "75%",
    position: "fixed",
  },
  thirdBackground: {
    background: theme.palette.paperBackground.gradient,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    backgroundSize: "cover",
    height: "100vh",
    width: "75%",
    position: "fixed",
  },
  skeletonDiv: {
    position: "fixed",
    width: "75%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
  skeleton: {
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});

class Layout extends React.Component {
  state = {
    countdown: "",
    hideReminder: false,

    finishedSettingUp: false,
  };

  marketCountdownInterval;
  checkStockQuotesInterval;
  accountSummaryChartSeriesInterval;

  updateCachedAccountSummaryChartSeries = () => {
    const { email, totalPortfolio } = this.props.userSession;
    updateCachedAccountSummaryChartInfoOneItem(
      email,
      convertToLocalTimeString(newDate()),
      totalPortfolio
    ).catch((err) => {
      console.log(err);
    });
  };

  setupIntervals = () => {
    this.marketCountdownInterval = setInterval(
      () =>
        marketCountdownUpdate(
          this.setState.bind(this),
          this.props.isMarketClosed
        ),
      oneSecond
    );

    if (this.props.userSession.hasFinishedSettingUp) {
      // this.checkStockQuotesInterval = setInterval(
      //   () =>
      //     checkStockQuotesToCalculateSharesValue(
      //       this.props.isMarketClosed,
      //       this.props.userSession,
      //       this.props.mutateUser
      //     ),
      //   30 * oneSecond
      // );

      this.accountSummaryChartSeriesInterval = setInterval(
        () => this.updateCachedAccountSummaryChartSeries(),
        oneMinute
      );
    }
  };

  componentDidMount() {
    console.log(this.props.userSession);

    if (shouldRedirectToLogin(this.props)) {
      redirectToPage("/login", this.props);
      return;
    }

    if (this.props.userSession.hasFinishedSettingUp) {
      mainSetup(
        this.props.isMarketClosed,
        this.props.userSession,
        this.props.mutateUser
      )
        .then((finishedSettingUp) => {
          this.setState({
            finishedSettingUp: true,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.setState({
        finishedSettingUp: true,
      });
    }

    socketCheckMarketClosed(
      socket,
      this.props.isMarketClosed,
      this.props.mutateMarket,
      this.state.countdown
    );

    this.setupIntervals();
  }

  componentDidUpdate() {
    if (shouldRedirectToLogin(this.props)) {
      redirectToPage("/login", this.props);
    }

    if (!isEmpty(this.state.countdown) && this.props.isMarketClosed) {
      clearInterval(this.marketCountdownInterval);
      this.setState({
        countdown: "",
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.marketCountdownInterval);
    clearInterval(this.checkStockQuotesInterval);
    clearInterval(this.accountSummaryChartSeriesInterval);

    offSocketListeners(socket, checkMarketClosed);
  }

  render() {
    const { classes, isMarketClosed } = this.props;
    const { countdown, finishedSettingUp } = this.state;

    if (shouldRedirectToLogin(this.props)) {
      return null;
    }

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar />
        <Reminder />
        <main className={classes.main}>
          <div className={classes.contentHeader} />
          <div className={classes.mainContent}>
            <div className={classes.mainBackground} />
            <div className={classes.secondBackground} />
            <div className={classes.thirdBackground} />
            <LayoutSpeedDial
              isMarketClosed={isMarketClosed}
              remainingTime={countdown}
            />
            {!finishedSettingUp && (
              <div className={classes.skeletonDiv}>
                <Skeleton variant="rect" className={classes.skeleton} />
              </div>
            )}
            {finishedSettingUp && this.props.children}
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
  mutateMarket: (method) => dispatch(marketAction(method)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(Layout)));
