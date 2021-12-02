import React from "react";

import { withTranslation } from "react-i18next";

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
  Visibility,
  VisibilityOff,
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
});

class SettingPasswordTextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onHover: false,
      visibility: false,
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

  seePassword = () => {
    this.setState({
      visibility: !this.state.visibility,
    });
  };

  mouseDownPassword = (event) => {
    event.preventDefault();
  };

  render() {
    const { t, classes, name, value, isInvalid, helper, onChange } = this.props;
    const { onHover, visibility } = this.state;

    return (
      <Container className={classes.textFieldContainer}>
        <Typography className={classes.title}>
          {t(`general.${name}`, name)}
        </Typography>
        <TextField
          fullWidth
          value={value}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          id={name}
          name={name}
          variant="outlined"
          type={!visibility ? "password" : "text"}
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
                      style={{ margin: "-15px", color: "white" }}
                    />
                  )}
                </IconButton>
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
          }}
          onChange={onChange}
        />
      </Container>
    );
  }
}

export default withTranslation()(withStyles(styles)(SettingPasswordTextField));
