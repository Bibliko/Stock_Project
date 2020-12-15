import React from "react";

import { withStyles } from "@material-ui/core/styles";

import { TextField, InputAdornment, IconButton } from "@material-ui/core";

import { EditRounded as EditRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  textField: {
    width: "100%",
    marginTop: "5px",
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
    color: "white",
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    "&:hover": {
      backgroundColor: theme.palette.paperBackground.onPageLight,
    },
    "& input": {
      backgroundColor: "transparent",
    },
    fontSize: "medium",
    height: "45px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
      height: "35px",
    },
  },
});

class SettingDatePickerTextField extends React.Component {
  state = {
    onHover: false,
  };

  onMouseOver = () => {
    this.setState({
      onHover: true,
    });
  };

  onMouseOut = () => {
    this.setState({
      onHover: false,
    });
  };
  render() {
    const {
      classes,
      onClick,
      id,
      inputRef,
      error,
      helperText,
      value,
      disabled,
      inputProps,
      InputProps,
    } = this.props;

    const { onHover } = this.state;

    return (
      <div>
        <TextField
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          onClick={onClick}
          id={id}
          ref={inputRef}
          error={error}
          helperText={helperText}
          value={value}
          disabled={disabled}
          variant="outlined"
          className={classes.textField}
          InputProps={{
            className: classes.input,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton disabled edge="start">
                  {onHover && (
                    <EditRoundedIcon
                      style={{ margin: "-12px", color: "white" }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            ...InputProps,
          }}
          {...inputProps}
        />
      </div>
    );
  }
}

export default withStyles(styles)(SettingDatePickerTextField);
