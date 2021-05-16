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

import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";

import {
  MenuRounded as MenuRoundedIcon,
  CloseRounded as CloseRoundedIcon,
  Timer as TimerIcon,
  TimerOff as TimerOffIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  speedDial: {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    zIndex: theme.customZIndex.floatingActionButton,
    "& .MuiFab-primary": {
      backgroundColor: theme.palette.layoutSpeedDial.main,
      height: "45px",
      width: "45px",
    },
    "&.MuiSpeedDial-directionUp": {
      "& .MuiSpeedDial-actions": {
        paddingBottom: "40px",
      },
    },
  },
  speedDialButton: {
    color: "white",
    height: "40px",
    width: "40px",
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
    // if (!isEqual(reason, "mouseEnter")) {
    //   this.setState({ open: true });
    // }
    this.setState({ open: true });
  };
  handleClose = (event, reason) => {
    // if (!isEqual(reason, "mouseLeave")) {
    //   this.setState({ open: false });
    // }
    this.setState({ open: false });
  };

  openMarketTimeDialog = () => {
    this.setState({ openMarketTimeDialog: true });
  };
  closeMarketTimeDialog = () => {
    this.setState({ openMarketTimeDialog: false });
  };

  componentDidMount() {
    this.marketCountdownInterval = setInterval(
      () => marketCountdownUpdate(this),
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
    const compareKeys = ["classes", "isMarketClosed"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
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
