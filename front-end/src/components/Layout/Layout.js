import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction, marketAction } from "../../redux/storeActions/actions";

import { socket } from "../../App";

import {
  shouldRedirectToLogin,
  redirectToPage,
} from "../../utils/low-dependency/PageRedirectUtil";

// TODO: Uncomment this in production
// import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";

// import { checkStockQuotesToCalculateSharesValue } from "../../utils/UserUtil";

import {
  joinUserRoom,
  checkMarketClosed,
  socketCheckMarketClosed,
  offSocketListeners,
  checkHasFinishedSettingUpUserCacheSession,
  checkFinishedUpdatingUserSession,
  finishedSettingUpUserCacheSession,
} from "../../utils/SocketUtil";

import { getGlobalBackendVariablesFlags } from "../../utils/BackendUtil";

import AppBar from "./AppBar";
import SubNavbar from "./SubNavbar";
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
    minHeight: `calc(${theme.customHeight.appBarHeight} + ${theme.customHeight.subBarHeight})`,
    [theme.breakpoints.down("xs")]: {
      minHeight: `calc(${theme.customHeight.appBarHeightSmall} + ${theme.customHeight.appBarHeightSmall})`,
    },
    justifyContent: "flex-start",
  },
  // gradientBackground: {
  //   background: theme.palette.paperBackground.gradient,
  //   backgroundSize: "cover",
  //   height: "100%",
  //   width: "100%",
  //   position: "fixed",
  // },
  background: {
    backgroundColor: theme.palette.paperBackground.main,
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

  setupIntervals = () => {
    // TODO: Uncomment this in production
    // if (this.props.userSession.hasFinishedSettingUp) {
    //   this.checkStockQuotesInterval = setInterval(
    //     () => checkStockQuotesToCalculateSharesValue(this),
    //     30 * oneSecond
    //   );
    // }
  };

  setupSocketListeners = () => {
    socketCheckMarketClosed(socket, this);

    checkFinishedUpdatingUserSession(socket, this);
  };

  clearIntervalsAndListeners = () => {
    clearInterval(this.checkStockQuotesInterval);

    offSocketListeners(socket, finishedSettingUpUserCacheSession);
    offSocketListeners(socket, checkMarketClosed);
  };

  afterSettingUpUserCacheSession = () => {
    const { finishedSettingUp } = this.state;
    if (!finishedSettingUp) {
      this.setState(
        {
          finishedSettingUp: true,
        },
        () => {
          this.setupSocketListeners();
          this.setupIntervals();
        }
      );
    }
  };

  componentDidMount() {
    if (shouldRedirectToLogin(this.props)) {
      redirectToPage("/login", this.props);
      return;
    }

    getGlobalBackendVariablesFlags()
      .then((flags) => {
        const { updatedAllUsersFlag, updatedRankingListFlag } = flags;

        this.setState(
          {
            updatedAllUsersFlagFromLayout: updatedAllUsersFlag,
            updatedRankingListFlagFromLayout: updatedRankingListFlag,
          },
          () => {
            socket.emit(joinUserRoom, this.props.userSession);
            checkHasFinishedSettingUpUserCacheSession(socket, this);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (shouldRedirectToLogin(this.props)) {
      redirectToPage("/login", this.props);
    }
  }

  componentWillUnmount() {
    this.clearIntervalsAndListeners();
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
        <SubNavbar />
        <Reminder />
        <main className={classes.main}>
          <div className={classes.background} />
          <div className={classes.contentHeader} />
          <div className={classes.mainContent}>
            {/* <div className={classes.gradientBackground} /> */}
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
