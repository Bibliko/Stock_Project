import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import MarketTimeDialog from "../Dialog/MarketTimeDialog";

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
      backgroundColor: "rgba(147, 102, 255, 1)",
      [theme.breakpoints.down("xs")]: {
        height: "40px",
        width: "40px",
      },
    },
  },
  speedDialButton: {
    color: "white",
    height: "56px",
    width: "56px",
    [theme.breakpoints.down("xs")]: {
      height: "40px",
      width: "40px",
    },
    backgroundColor: "rgba(147, 102, 255, 1)",
    "&:hover": {
      backgroundColor: "rgba(147, 102, 255, 0.85)",
    },
  },
});

class LayoutSpeedDial extends React.Component {
  state = {
    open: false,

    openMarketTimeDialog: false,
  };

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

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["isMarketClosed", "remainingTime"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const { classes, isMarketClosed, remainingTime } = this.props;

    const { open, openMarketTimeDialog } = this.state;

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
            icon={isMarketClosed ? <TimerIcon /> : <TimerOffIcon />}
            tooltipTitle={"Market Time"}
            onClick={this.openMarketTimeDialog}
            classes={{ fab: classes.speedDialButton }}
          />
        </SpeedDial>
        <MarketTimeDialog
          openMarketTimeDialog={openMarketTimeDialog}
          handleClose={this.closeMarketTimeDialog}
          isMarketClosed={isMarketClosed}
          remainingTime={remainingTime}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(LayoutSpeedDial));
