import React from "react";
import clsx from "clsx";
import { ComponentWithForwardedRef } from "../../../utils/ComponentUtil";

import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";

import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import { isEmpty } from "lodash";

const styles = (theme) => ({
  textField: {
    width: "50%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
    margin: "8px",
    fontWeight: "normal",
    color: "white",
    "& .MuiOutlinedInput-underline:after": {
      borderBottom: "2px solid #000000",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 0.8)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 1)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 1)",
    },
    "& .MuiFormLabel-root": {
      [theme.breakpoints.down("xs")]: {
        fontSize: "small",
      },
      color: "rgba(255, 255, 255, 0.8)",
      "&.Mui-focused": {
        color: "rgba(156, 140, 249, 1)",
      },
    },
  },
  input: {
    color: "white",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
  iconButton: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  hide: {
    display: "none",
  },
});

/**
 * props required:
 * name
 * function changeData
 * function clearData
 */

class InputTextFieldWithDeleteButton extends React.Component {
  state = {
    value: "",
  };

  changeInput = (event) => {
    this.setState({
      value: event.target.value,
    });
  };

  clearInput = () => {
    this.setState({
      value: "",
    });
  };

  render() {
    const { classes, name, forwardedRef, changeData, clearData } = this.props;

    return (
      <TextField
        id={name}
        ref={forwardedRef}
        name={name}
        value={this.state.value}
        label={name}
        autoComplete="off"
        variant="outlined"
        margin="normal"
        className={classes.textField}
        InputProps={{
          className: classes.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                className={clsx(classes.iconButton, {
                  [classes.hide]: isEmpty(this.state.value),
                })}
                onClick={() => {
                  clearData();
                  this.clearInput();
                }}
              >
                <ClearRoundedIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={(event) => {
          changeData(event);
          this.changeInput(event);
        }}
      />
    );
  }
}

export default ComponentWithForwardedRef(
  withStyles(styles)(InputTextFieldWithDeleteButton)
);
