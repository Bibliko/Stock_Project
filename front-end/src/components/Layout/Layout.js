import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction, marketAction } from "../../redux/storeActions/actions";

import { socket } from "../../App";

import {
  shouldRedirectToLogin,
  redirectToPage,
} from "../../utils/low-dependency/PageRedirectUtil";

import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";

import { checkStockQuotesToCalculateSharesValue } from "../../utils/UserUtil";

import {
  joinUserRoom,
  checkMarketClosed,
  socketCheckMarketClosed,
  updatedAllUsersFlag,
  updatedRankingListFlag,
  offSocketListeners,
  checkIsDifferentFromSocketUpdatedAllUsersFlag,
  checkIsDifferentFromSocketUpdatedRankingListFlag,
  checkHasFinishedSettingUpUserCacheSession,
  checkFinishedUpdatingUserSession,
} from "../../utils/SocketUtil";

import { getGlobalBackendVariablesFlags } from "../../utils/BackendUtil";

import AppBar from "./AppBar";
import Reminder from "../Reminder/Reminder";
import LayoutSpeedDial from "../SpeedDial/LayoutSpeedDial";

import { withStyles } from "@material-ui/core/styles";

import { CssBaseline, Snackbar, Button, IconButton } from "@material-ui/core";

import { Skeleton } from "@material-ui/lab";

import { Close as CloseIcon } from "@material-ui/icons";

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
  refreshCard: {
    "& .MuiSnackbarContent-root": {
      backgroundColor: theme.palette.refreshSnackbar.main,
    },
    top: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      top: theme.customMargin.topLayoutSmall,
    },
  },
  reloadButton: {
    color: theme.palette.refreshSnackbar.reloadButton,
    fontWeight: "bold",
  },
});

class Layout extends React.Component {
  state = {
    hideReminder: false,
    finishedSettingUp: false,

    updatedAllUsersFlagFromLayout: false,
    updatedRankingListFlagFromLayout: false,
    openRefreshCard: false,
  };

  checkStockQuotesInterval;

  handleCloseRefreshCard = (event, reason) => {
    if (reason !== "clickaway") {
      this.setState({
        openRefreshCard: false,
      });
    }
  };

  reloadLayout = () => {
    window.location.reload();
  };

  setupIntervals = () => {
    // if (this.props.userSession.hasFinishedSettingUp) {
    //   this.checkStockQuotesInterval = setInterval(
    //     () => checkStockQuotesToCalculateSharesValue(this),
    //     30 * oneSecond
    //   );
    // }
  };

  setupSocketListeners = () => {
    socketCheckMarketClosed(socket, this);
    checkIsDifferentFromSocketUpdatedAllUsersFlag(socket, this);
    checkIsDifferentFromSocketUpdatedRankingListFlag(socket, this);
    checkFinishedUpdatingUserSession(socket, this);
  };

  clearIntervalsAndListeners = () => {
    clearInterval(this.checkStockQuotesInterval);
    offSocketListeners(socket, checkMarketClosed);
    offSocketListeners(socket, updatedAllUsersFlag);
    offSocketListeners(socket, updatedRankingListFlag);
  };

  afterSettingUpUserCacheSession = () => {
    this.setState(
      {
        finishedSettingUp: true,
      },
      () => {
        this.setupIntervals();
      }
    );
  };

  componentDidMount() {
    console.log(this.props.userSession);

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
            this.setupSocketListeners();
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
    const { finishedSettingUp, openRefreshCard } = this.state;

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
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={openRefreshCard}
          className={classes.refreshCard}
          onClose={this.handleCloseRefreshCard}
          message="New Data / Refresh Page"
          action={
            <React.Fragment>
              <Button
                className={classes.reloadButton}
                size="small"
                onClick={this.reloadLayout}
              >
                RELOAD
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleCloseRefreshCard}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
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
