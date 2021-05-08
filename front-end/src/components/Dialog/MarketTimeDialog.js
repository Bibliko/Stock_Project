import React from "react";
import { isEqual, isEmpty } from "lodash";
import { withRouter } from "react-router";

import SegmentedBar from "../ProgressBar/SegmentedBar";

import { withStyles } from "@material-ui/core/styles";
import { Dialog, DialogTitle, Typography } from "@material-ui/core";

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
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
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
    return (
      !isEqual(nextProps, this.props) ||
      !isEqual(nextState, this.state)
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
        {!isMarketClosed && isEmpty(remainingTime) && <SegmentedBar />}
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
