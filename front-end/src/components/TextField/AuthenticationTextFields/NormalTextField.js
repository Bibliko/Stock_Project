import React from "react";

import { withStyles } from "@material-ui/core/styles";
import { TextField, InputAdornment, IconButton } from "@material-ui/core";

import {
  MailOutlineRounded as MailOutlineRoundedIcon,
  VpnKeyRounded as VpnKeyRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  textField: {
    height: 50,
    margin: "8px",
    fontWeight: "normal",
    "& label.Mui-focused": {
      color: "black",
    },
    "& .MuiFilledInput-underline:after": {
      borderBottom: "2px solid #000000",
    },
    "& .MuiFilledInput-root": {
      "&.Mui-focused": {
        backgroundColor: "rgba(225,225,225,0.5)",
      },
    },
  },
  input: {
    color: "black",
    backgroundColor: "rgba(225,225,225,0.65)",
    "&:hover": {
      backgroundColor: "rgba(225,225,225,0.5)",
    },
    "& input": {
      backgroundColor: "rgba(225,225,225,0)",
    },
  },
  iconButton: {
    "&$disabled": {
      color: "rgba(0, 0, 0, 0.54)",
    },
  },
  disabled: {}, // dummy css for styling disabled Material UI buttons
});

/**
 * props required:
 * name
 * function changeData
 * function enterData
 */

class NormalTextField extends React.Component {
  render() {
    const { classes, name, changeData, enterData } = this.props;

    return (
      <TextField
        id={name}
        name={name}
        label={name}
        variant="filled"
        margin="normal"
        required
        autoComplete="email"
        className={classes.textField}
        InputProps={{
          className: classes.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled
                edge="end"
                classes={{
                  root: classes.iconButton,
                  disabled: classes.disabled,
                }}
              >
                {name === "Email" && <MailOutlineRoundedIcon />}
                {name === "Code" && <VpnKeyRoundedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={changeData}
        onKeyDown={enterData}
      />
    );
  }
}

export default withStyles(styles)(NormalTextField);
