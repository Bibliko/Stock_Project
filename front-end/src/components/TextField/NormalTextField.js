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
    const { classes } = this.props;

    return (
      <TextField
        id={this.props.name}
        name={this.props.name}
        label={this.props.name}
        variant="filled"
        margin="normal"
        required
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
                {this.props.name === "Email" && <MailOutlineRoundedIcon />}
                {this.props.name === "Code" && <VpnKeyRoundedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={this.props.changeData}
        onKeyDown={this.props.enterData}
      />
    );
  }
}

export default withStyles(styles)(NormalTextField);
