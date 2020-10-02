import React from "react";
import clsx from "clsx";

import { withStyles } from "@material-ui/core/styles";

import {
  Button,
  CircularProgress,
} from "@material-ui/core";

const styles = (theme) => ({
  fullWidth: {
    width: "100%",
  },
  buttonSuccess: {
    backgroundColor: "rgb(50,205,50)",
    "&:hover": {
      backgroundColor: "rgb(34,139,34)",
    },
  },
  buttonFail: {
    backgroundColor: "red",
    "&:hover": {
      backgroundColor: "rgb(178,34,34)",
    },
  },
  button: {
    "&.Mui-disabled": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
    },
  },
  progress: {
    color: "green",
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

function ProgressButton(props) {
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
  } = props;
  const buttonClassname = clsx(
    classes.button,{
    [classes.buttonSuccess]: success,
    [classes.buttonFail]: fail,
  });

  return (
    <div
      className={clsx(classes.buttonWrapper, classes.fullWidth, containerClass)}
    >
      <Button
        fullWidth
        aria-label="save file"
        color="primary"
        size={size}
        variant="contained"
        disableElevation
        disabled={loading || disabled}
        className={buttonClassname}
        onClick={handleClick}
      >
        {children}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.progress} />
      )}
    </div>
  );
}

export default withStyles(styles)(ProgressButton);