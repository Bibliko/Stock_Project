import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction, marketAction } from "../../redux/storeActions/actions";

import { socket } from "../../App";
import { mainSetup } from "./setupForCachingInLayout";

import {
  shouldRedirectToLogin,
  redirectToPage,
} from "../../utils/low-dependency/PageRedirectUtil";

import { oneMinute, newDate } from "../../utils/low-dependency/DayTimeUtil";

import {
  checkMarketClosed,
  socketCheckMarketClosed,
  offSocketListeners,
} from "../../utils/SocketUtil";

import { updateCachedAccountSummaryChartInfoOneItem } from "../../utils/RedisUtil";

import AppBar from "./AppBar";
import Reminder from "../Reminder/Reminder";
import LayoutSpeedDial from "../SpeedDial/LayoutSpeedDial";

import { withStyles } from "@material-ui/core/styles";

import { CssBaseline } from "@material-ui/core";

import { Skeleton } from "@material-ui/lab";

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
  gradientBackground: {
    background: theme.palette.paperBackground.gradient,
    backgroundSize: "cover",
    height: "100%",
    width: "100%",
    position: "fixed",
  },
  secondLayerBackground: {
    background: "rgba(25, 19, 89, 1)",
    backgroundSize: "cover",
    height: "100vh",
    width: "100%",
    position: "fixed",
  },
  bottomSpace: {
    width: "100%",
    height: "50px",
  },
  skeletonDiv: {
    position: "fixed",
    width: theme.customWidth.mainSkeletonWidth,
  },
  skeleton: {
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});

class Layout extends React.Component {
  state = {
    hideReminder: false,
    finishedSettingUp: false,
  };

  checkStockQuotesInterval;
  accountSummaryChartSeriesInterval;

  updateCachedAccountSummaryChartSeries = () => {
    const { email, totalPortfolio } = this.props.userSession;
    updateCachedAccountSummaryChartInfoOneItem(
      email,
      newDate(),
      totalPortfolio
    ).catch((err) => {
      console.log(err);
    });
  };

  setupIntervals = () => {
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
      this.props.mutateMarket
    );

    this.setupIntervals();
  }

  componentDidUpdate() {
    if (shouldRedirectToLogin(this.props)) {
      redirectToPage("/login", this.props);
    }
  }

  componentWillUnmount() {
    clearInterval(this.checkStockQuotesInterval);
    clearInterval(this.accountSummaryChartSeriesInterval);

    offSocketListeners(socket, checkMarketClosed);
  }

  render() {
    const { classes } = this.props;
    const { finishedSettingUp } = this.state;

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
            <div className={classes.secondLayerBackground} />
            <div className={classes.gradientBackground} />
            <LayoutSpeedDial />
            {!finishedSettingUp && (
              <div className={classes.skeletonDiv}>
                <Skeleton variant="rect" className={classes.skeleton} />
              </div>
            )}
            {finishedSettingUp && this.props.children}
            <div className={classes.bottomSpace} />
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
