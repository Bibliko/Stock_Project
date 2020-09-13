import React from "react";

import clsx from "clsx";

import SettingNormalTextField from "../TextField/SettingNormalTextField";
import SettingPasswordTextField from "../TextField/SettingPasswordTextField";

import { withStyles } from "@material-ui/core/styles";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import {
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

const styles = (theme) => ({
  gridContainer: {
    marginBottom: "30px",
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "15px",
      marginTop: "10px",
    },
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minWidth: "150px",
  },
  passwordGridContainer: {
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginTop: "10px",
    },
  },
  passwordGridItem: {
    paddingLeft: "40px !important",
    paddingRight: "20px !important",
    [theme.breakpoints.down("xs")]: {
      paddingLeft: "30px !important",
      paddingRight: "10px !important",
    },
  },
  passwordTitle: {
    color: "white",
    fontSize: "20px",
    marginLeft: "5px",
    marginBottom: "3px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
      marginLeft: "8px",
    },
    fontWeight: "bold",
  },
  text: {
    fontSize: "18px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
});

const PasswordAccordion = withStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  expanded: {},
}))(Accordion);

const PasswordAccordionSummary = withStyles((theme) => ({
  root: {
    borderRadius: "4px",
    backgroundColor: "rgba(225,225,225,0.6)",
    "&:hover": {
      backgroundColor: "rgba(225,225,225,0.7)",
    },
  },
  expanded: {},
}))(AccordionSummary);

class SensitiveSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wrongPassword: false,
      invalidPassword: false,
      unmatchedPassword: false,
      show: false,
      input: {
        email: this.props.email,
        oldPassword: "",
        newPassword: "",
        confirmedPassword: "",
      },
    };
    this.newPassword = this.props.oldPassword;
    this.hasError = false;
  }

  toggle = () => {
    this.setState({
      show: !this.state.show,
    });
    if (this.state.show) this.reset();
    this.props.recordChanges(this.createChangeLog());
  }

  reset() {
    this.newPassword = this.props.oldPassword;
    this.hasError = false;
    this.setState({
      wrongPassword: false,
      invalidPassword: false,
      unmatchedPassword: false,
      show: false,
      input: {
        email: this.props.email,
        oldPassword: "",
        newPassword: "",
        confirmedPassword: "",
      },
    });
  }

  createChangeLog() {
    return { password: this.newPassword };
  }

  checkOldPassword = (event) => {
    const input = { ...this.state.input, oldPassword: event.target.value };
    let wrongPassword = this.props.oldPassword !== event.target.value;
    if (!event.target.value && !input.newPassword && !input.confirmedPassword)
      wrongPassword = false;
    this.setState({
      input: input,
      wrongPassword: wrongPassword,
    });
    this.hasError =
      wrongPassword ||
      this.state.invalidPassword ||
      this.state.unmatchedPassword;
  }

  recordNewPassword = (event) => {
    const input = { ...this.state.input, newPassword: event.target.value };
    this.newPassword = event.target.value || this.props.oldPassword;

    let wrongPassword = this.state.wrongPassword;
    if (event.target.value && !input.oldPassword)
      // not empty and oldPassword is empty
      wrongPassword = true;
    else if (!event.target.value && !input.oldPassword && !input.confirmedPassword)
      // everthing is empty
      wrongPassword = false;

    this.setState({
      input: input,
      wrongPassword: wrongPassword,
      invalidPassword: this.newPassword.length < 8,
      unmatchedPassword: input.confirmedPassword !== event.target.value,
    });

    this.hasError =
      wrongPassword ||
      (!!this.newPassword && this.newPassword.length < 8) ||
      input.confirmedPassword !== event.target.value;
    this.props.recordChanges(this.createChangeLog());
  }

  recordConfirmedPassword = (event) => {
    const input = { ...this.state.input, confirmedPassword: event.target.value };
    let wrongPassword = this.state.wrongPassword;
    if (event.target.value && !input.oldPassword)
      // not empty and oldPassword is empty
      wrongPassword = true;
    else if (!event.target.value && !input.oldPassword && !input.confirmedPassword)
      // everthing is empty
      wrongPassword = false;

    this.setState({
      input: input,
      wrongPassword: wrongPassword,
      unmatchedPassword: input.newPassword !== event.target.value,
    });

    this.hasError =
      wrongPassword ||
      this.state.invalidPassword ||
      input.newPassword !== event.target.value;
    this.props.recordChanges(this.createChangeLog());
  }

  render() {
    const { classes } = this.props;
    const {
      show,
      wrongPassword,
      invalidPassword,
      unmatchedPassword,
      input,
    } = this.state;

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={2}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <SettingNormalTextField
              name="Email"
              disabled={true}
              value={input.email}
              isInvalid={!input.email}
              helper="Cannot be empty"
              // onChange={}
            />
          </Grid>

          <Grid
            item
            xs={12}
            className={clsx(classes.itemGrid, classes.passwordGridItem)}
          >
            <Typography className={classes.passwordTitle}>Password</Typography>
            <PasswordAccordion expanded={show} onChange={this.toggle}>
              <PasswordAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="password-section"
              >
                <Typography className={classes.text}>
                  Change Password
                </Typography>
              </PasswordAccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  className={clsx(
                    classes.fullHeightWidth,
                    classes.passwordGridContainer
                  )}
                >
                  <Grid item xs={12} className={classes.itemGrid}>
                    <SettingPasswordTextField
                      value={input.oldPassword}
                      name="Current Password"
                      isInvalid={wrongPassword}
                      helper="Incorrect password"
                      onChange={this.checkOldPassword}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.itemGrid}>
                    <SettingPasswordTextField
                      value={input.newPassword}
                      name="New Password"
                      isInvalid={invalidPassword}
                      helper="Password must contain at least 8 characters"
                      onChange={this.recordNewPassword}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.itemGrid}>
                    <SettingPasswordTextField
                      value={input.confirmedPassword}
                      name="Confirm New Password"
                      isInvalid={unmatchedPassword}
                      helper="Password doesn't match"
                      onChange={this.recordConfirmedPassword}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </PasswordAccordion>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(SensitiveSection);
