import React from "react";
import { isEqual, pick, isEmpty } from "lodash";
import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = (theme) => ({
  textInsideDialog: {
    alignSelf: "center",
    fontSize: "large",
  },
  dialogPaper: {
    "& .MuiDialog-paper": {
      paddingTop: 16,
      paddingBottom: 32,
      backgroundColor: theme.palette.paperBackground.onPage,
      color: "white",
    },
  },
  dialogTitle: {
    "& .MuiTypography-root": {
      [theme.breakpoints.down("xs")]: {
        fontSize: "medium",
      },
      fontWeight: "bold",
    },
  },
});

class MarketTimeDialog extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = [
      "isMarketClosed",
      "remainingTime",
      "openMarketTimeDialog",
    ];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const {
      classes,

      openMarketTimeDialog,
      handleClose,
      isMarketClosed,
      remainingTime,
    } = this.props;

    return (
      <Dialog
        onClose={handleClose}
        open={openMarketTimeDialog}
        className={classes.dialogPaper}
      >
        <DialogTitle className={classes.dialogTitle}>
          Time Until Market Closed
        </DialogTitle>
        {!isMarketClosed && !isEmpty(remainingTime) && (
          <Typography className={classes.textInsideDialog}>
            {remainingTime}
          </Typography>
        )}
        {!isMarketClosed && isEmpty(remainingTime) && <CircularProgress />}
        {isMarketClosed && (
          <Typography className={classes.textInsideDialog}>
            Market Closed
          </Typography>
        )}
      </Dialog>
    );
  }
}

export default withStyles(styles)(withRouter(MarketTimeDialog));
