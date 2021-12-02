import React from "react";

import { withTranslation } from "react-i18next";

import { withStyles } from "@material-ui/core/styles";
import { TextField, InputAdornment, IconButton } from "@material-ui/core";

import { Visibility, VisibilityOff } from "@material-ui/icons";

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
      paddingRight: "12px",
    },
  },
});

/**
 * props required:
 * name
 * function changePassword
 * function enterPassword
 */

class PasswordTextField extends React.Component {
  state = {
    visibility: false,
  };

  seePassword = () => {
    this.setState({
      visibility: !this.state.visibility,
    });
  };

  mouseDownPassword = (event) => {
    event.preventDefault();
  };

  render() {
    const {
      t,
      classes,
      name,
      changePassword,
      enterPassword,
      createOrLogin,
    } = this.props;

    const { visibility } = this.state;

    return (
      <TextField
        id={name}
        name={name}
        label={t(`general.${name}`, name)}
        type={!visibility ? "password" : "text"}
        variant="filled"
        margin="normal"
        required
        autoComplete={
          createOrLogin === "login" ? "current-password" : "new-password"
        }
        className={classes.textField}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={this.seePassword}
                onMouseDown={this.mouseDownPassword}
                edge="end"
              >
                {visibility ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
          className: classes.input,
        }}
        onChange={changePassword}
        onKeyDown={enterPassword}
      />
    );
  }
}

export default withTranslation()(withStyles(styles)(PasswordTextField));
