import React from "react";
import validator from "email-validator";
import clsx from "clsx";
import { socket } from '../../App';

import SettingNormalTextField from "../TextField/SettingTextFields/SettingNormalTextField";
import SettingPasswordTextField from "../TextField/SettingTextFields/SettingPasswordTextField";

import {
  sendVerificationCode,
  checkVerificationCode,
  changeUserEmail,
} from "../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";

import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";

import {
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Container,
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
    marginBottom: "10px",
  },
  passwordGridContainer: {
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginTop: "10px",
    },
  },
  passwordGridItem: {
    paddingLeft: "30px !important",
    paddingRight: "10px !important",
    [theme.breakpoints.down("xs")]: {
      paddingLeft: "25px !important",
      paddingRight: "5px !important",
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
  emailSendCodeButton: {
    color: theme.palette.primary.main,
  },
  codeButtonContainer: {
    maxWidth: "none",
    minWidth: "150px",
    margin: "10px",
  },
  hide: {
    display: "none",
  },
  emailSuccess: {
    color: theme.palette.succeed.main,
    fontSize: "small",
    marginBottom: "8px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "smaller",
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
    "&:focus": {
      backgroundColor: "rgba(225,225,225,0.7)",
    },
    minHeight: theme.customHeight.settingTextFieldSmall,
    height: theme.customHeight.settingTextField,
    [theme.breakpoints.down("xs")]: {
      height: theme.customHeight.settingTextFieldSmall,
    },
    "&.Mui-expanded": {
      minHeight: theme.customHeight.settingTextFieldSmall,
      height: theme.customHeight.settingTextField,
      [theme.breakpoints.down("xs")]: {
        height: theme.customHeight.settingTextFieldSmall,
      },
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

      verificationCode: "",
      verificationCodeError: "",

      showSendVerificationCode: false,
      emailSuccess: "",
      emailError: "",
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
  };

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
      verificationCode: "",
      verificationCodeError: "",
      showSendVerificationCode: false,
      emailSuccess: "",
      emailError: "",
    });
  }

  createChangeLog() {
    return { password: this.newPassword };
  }

  recordNewEmail = (event) => {
    const input = { ...this.state.input, email: event.target.value };
    this.email = event.target.value;

    if (this.email === this.props.email) {
      this.setState({
        input: input,
        emailSuccess: "",
        emailError: "",
        showSendVerificationCode: false,
        verificationCode: "",
      });
      return;
    }

    if (!validator.validate(this.email)) {
      this.setState({
        input: input,
        emailSuccess: "",
        emailError: "Invalid email",
        showSendVerificationCode: false,
        verificationCode: "",
      });
    } else {
      this.setState({
        input: input,
        emailSuccess: "",
        emailError: "",
        showSendVerificationCode: true,
        verificationCode: "",
      });
    }
  };

  recordVerificationCode = (event) => {
    this.setState({
      verificationCode: event.target.value,
    });
  };

  sendVerificationCode = () => {
    sendVerificationCode(this.email, "email")
      .then(() => {
        this.setState({
          emailSuccess: "Email Verification Code has been sent",
          emailError: "",
        });
      })
      .catch((err) => {
        this.setState({ emailSuccess: "", emailError: err });
      });
  };

  confirmVerificationCode = () => {
    checkVerificationCode(this.email, this.state.verificationCode, "email")
      .then(() => {
        this.setState(
          {
            emailSuccess: "",
            emailError: "",
            showSendVerificationCode: false,
            verificationCode: "",
            verificationCodeError: "",
          },
          () => {
            changeUserEmail(
              this.props.email,
              this.email,
              this.props.mutateUser,
              socket
            ).catch((err) => {
              console.log(err);
            });
          }
        );
      })
      .catch((err) => {
        this.setState({
          verificationCodeError: err,
        });
      });
  };

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
  };

  recordNewPassword = (event) => {
    const input = { ...this.state.input, newPassword: event.target.value };
    this.newPassword = event.target.value || this.props.oldPassword;

    let wrongPassword = this.state.wrongPassword;
    if (event.target.value && !input.oldPassword)
      // not empty and oldPassword is empty
      wrongPassword = true;
    else if (
      !event.target.value &&
      !input.oldPassword &&
      !input.confirmedPassword
    )
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
  };

  recordConfirmedPassword = (event) => {
    const input = {
      ...this.state.input,
      confirmedPassword: event.target.value,
    };
    let wrongPassword = this.state.wrongPassword;
    if (event.target.value && !input.oldPassword)
      // not empty and oldPassword is empty
      wrongPassword = true;
    else if (
      !event.target.value &&
      !input.oldPassword &&
      !input.confirmedPassword
    )
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
  };

  render() {
    const { classes, email } = this.props;
    const {
      show,
      wrongPassword,
      invalidPassword,
      unmatchedPassword,
      input,

      showSendVerificationCode,
      emailError,
      emailSuccess,
      verificationCode,
      verificationCodeError,
    } = this.state;

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={4}
          direction="row"
          className={clsx(classes.fullWidth, classes.gridContainer)}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <SettingNormalTextField
              name="Email"
              disabled={emailSuccess !== ""}
              defaultValue={email}
              value={input.email}
              isInvalid={emailError !== ""}
              helper={emailError}
              onChange={this.recordNewEmail}
            />
            <Container
              className={clsx(classes.codeButtonContainer, {
                [classes.hide]: !showSendVerificationCode,
              })}
            >
              {emailSuccess !== "" && (
                <Typography className={classes.emailSuccess}>
                  {emailSuccess}
                </Typography>
              )}
              <Button
                className={classes.emailSendCodeButton}
                onClick={this.sendVerificationCode}
              >
                Send Verification Code
              </Button>
            </Container>
            {emailSuccess !== "" && (
              <SettingNormalTextField
                name="Code"
                value={verificationCode}
                isInvalid={verificationCodeError !== ""}
                helper={verificationCodeError}
                onChange={this.recordVerificationCode}
              />
            )}
            <Container
              className={clsx(classes.codeButtonContainer, {
                [classes.hide]: emailSuccess === "",
              })}
            >
              <Button
                className={classes.emailSendCodeButton}
                onClick={this.confirmVerificationCode}
              >
                Confirm
              </Button>
            </Container>
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
