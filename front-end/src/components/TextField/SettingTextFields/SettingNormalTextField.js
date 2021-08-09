import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";

import {
  TextField,
  Typography,
  Container,
  InputAdornment,
  IconButton,
} from "@material-ui/core";

import {
  EditRounded as EditRoundedIcon,
  ReplayRounded as ReplayRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  textFieldContainer: {
    maxWidth: "none",
    minWidth: "150px",
    marginLeft: "10px",
    marginRight: "10px",
    paddingLeft: "0px",
    paddingRight: "0px",
  },
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
    height: theme.customHeight.settingTextField,
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
      height: theme.customHeight.settingTextFieldSmall,
    },
    "& .MuiOutlinedInput-input": {
      paddingTop: "10px",
      paddingBottom: "10px",
      [theme.breakpoints.down("xs")]: {
        paddingTop: "6px",
        paddingBottom: "6px",
      },
    },
    "&.Mui-disabled": {
      color: theme.palette.disabled.whiteColor,
    },
  },
  title: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    paddingLeft: "5px",
    fontWeight: "bold",
  },
  iconButton: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    padding: 0,
    margin: "5px",
  },
  hide: {
    display: "none",
  },
});

class SettingNormalTextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onHover: false,
    };
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
  }

  onMouseOver() {
    this.setState({
      onHover: true,
    });
  }

  onMouseOut() {
    this.setState({
      onHover: false,
    });
  }

  resetValue = () => {
    const { defaultValue } = this.props;
    const event = {
      target: {
        value: defaultValue,
      },
    };
    this.props.onChange(event);
  };

  render() {
    const {
      classes,
      containerClass,
      name,
      value,
      isInvalid,
      helper,
      onChange,
      disabled,
    } = this.props;
    const { onHover } = this.state;

    return (
      <Container className={clsx(classes.textFieldContainer, containerClass)}>
        <Typography className={classes.title}>
          {name}
          <IconButton
            onClick={this.resetValue}
            className={clsx(classes.iconButton, {
              [classes.hide]: name !== "Email",
            })}
          >
            <ReplayRoundedIcon />
          </IconButton>
        </Typography>
        <TextField
          fullWidth
          autoFocus={name === "Code"}
          disabled={disabled}
          value={value}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          id={name}
          name={name}
          variant="outlined"
          error={isInvalid}
          helperText={isInvalid && helper}
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
          }}
          onChange={onChange}
        />
      </Container>
    );
  }
}

export default withStyles(styles)(SettingNormalTextField);
