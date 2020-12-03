import React from "react";
import clsx from "clsx";

import { withStyles } from "@material-ui/core/styles";

import { Button, CircularProgress } from "@material-ui/core";

const styles = (theme) => ({
  fullWidth: {
    width: "100%",
  },
  buttonSuccess: {
    backgroundColor: `${theme.palette.succeed.sub} !important`,
    "&:hover": {
      backgroundColor: `${theme.palette.succeed.subHover} !important`,
    },
  },
  buttonFail: {
    backgroundColor: `${theme.palette.fail.main} !important`,
    "&:hover": {
      backgroundColor: `${theme.palette.fail.mainHover} !important`,
    },
  },
  button: {
    "&.Mui-disabled": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
    },
    color: theme.palette.normalFontColor.primary,
    backgroundColor: theme.palette.primary.subDark,
    "&:hover": {
      backgroundColor: theme.palette.primary.subDarkHover,
    },
  },
  progress: {
    color: theme.palette.secondary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  buttonWrapper: {
    position: "relative",
  },
});

class ProgressButton extends React.Component {
  render() {
    const {
      classes,
      containerClass,
      disabled,
      size,
      success,
      fail,
      loading,
      handleClick,
      children,
    } = this.props;

    return (
      <div
        className={clsx(
          classes.buttonWrapper,
          classes.fullWidth,
          containerClass
        )}
      >
        <Button
          fullWidth
          aria-label="Save"
          size={size}
          variant="contained"
          disableElevation
          disabled={loading || disabled}
          className={clsx(classes.button, {
            [classes.buttonSuccess]: success,
            [classes.buttonFail]: fail,
          })}
          onClick={handleClick}
        >
          {children}
        </Button>
        {loading && <CircularProgress size={24} className={classes.progress} />}
      </div>
    );
  }
}

export default withStyles(styles)(ProgressButton);
