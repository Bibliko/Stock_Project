import React from "react";
import { isEqual, pick } from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import MarketTimeDialog from "../Dialog/MarketTimeDialog";

import {
  marketCountdownUpdate,
  oneSecond,
} from "../../utils/low-dependency/DayTimeUtil";

import { withStyles } from "@material-ui/core/styles";

import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";

import MenuRoundedIcon from "@material-ui/icons/MenuRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import TimerIcon from "@material-ui/icons/Timer";
import TimerOffIcon from "@material-ui/icons/TimerOff";

const styles = (theme) => ({
  speedDial: {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    zIndex: theme.customZIndex.floatingActionButton,
    [theme.breakpoints.down("xs")]: {
      width: "40px",
    },
    "& .MuiFab-primary": {
      backgroundColor: theme.palette.layoutSpeedDial.main,
      [theme.breakpoints.down("xs")]: {
        height: "50px",
        width: "50px",
      },
    },
  },
  speedDialButton: {
    color: "white",
    height: "56px",
    width: "56px",
    [theme.breakpoints.down("xs")]: {
      height: "50px",
      width: "50px",
    },
    backgroundColor: theme.palette.layoutSpeedDial.main,
    "&:hover": {
      backgroundColor: theme.palette.layoutSpeedDial.onHover,
    },
  },
});

class LayoutSpeedDial extends React.Component {
  state = {
    open: false,
    openMarketTimeDialog: false,

    countdown: "",
  };

  marketCountdownInterval;

  handleOpen = (event, reason) => {
    if (!isEqual(reason, "mouseEnter")) {
      this.setState({ open: true });
    }
  };
  handleClose = (event, reason) => {
    if (!isEqual(reason, "mouseLeave")) {
      this.setState({ open: false });
    }
  };

  openMarketTimeDialog = () => {
    this.setState({ openMarketTimeDialog: true });
  };
  closeMarketTimeDialog = () => {
    this.setState({ openMarketTimeDialog: false });
  };

  componentDidMount() {
    this.marketCountdownInterval = setInterval(
      () =>
        marketCountdownUpdate(
          this.setState.bind(this),
          this.props.isMarketClosed
        ),
      oneSecond
    );
  }

  componentDidUpdate() {
    if (this.props.isMarketClosed) {
      this.setState({
        countdown: "",
      });
      clearInterval(this.marketCountdownInterval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.marketCountdownInterval);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["isMarketClosed"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const { classes, isMarketClosed } = this.props;

    const { open, openMarketTimeDialog, countdown } = this.state;

    return (
      <React.Fragment>
        <SpeedDial
          ariaLabel="Layout SpeedDial"
          className={classes.speedDial}
          icon={
            <SpeedDialIcon
              icon={<MenuRoundedIcon />}
              openIcon={<CloseRoundedIcon />}
            />
          }
          onClose={this.handleClose}
          onOpen={this.handleOpen}
          open={open}
          direction="up"
        >
          <SpeedDialAction
            icon={!isMarketClosed ? <TimerIcon /> : <TimerOffIcon />}
            tooltipTitle={"Market Time"}
            onClick={this.openMarketTimeDialog}
            classes={{ fab: classes.speedDialButton }}
          />
        </SpeedDial>
        <MarketTimeDialog
          openMarketTimeDialog={openMarketTimeDialog}
          handleClose={this.closeMarketTimeDialog}
          isMarketClosed={isMarketClosed}
          remainingTime={countdown}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  isMarketClosed: state.isMarketClosed,
});

export default connect(
  mapStateToProps,
  null
)(withStyles(styles)(withRouter(LayoutSpeedDial)));
