import React from "react";
import validator from "email-validator";
import clsx from "clsx";
import { socket } from "../../App";

import { withTranslation } from "react-i18next";

import SettingNormalTextField from "../TextField/SettingTextFields/SettingNormalTextField";
import SettingPasswordTextField from "../TextField/SettingTextFields/SettingPasswordTextField";

import {
  sendVerificationCode,
  checkVerificationCode,
  changeUserEmail,
  getUserData,
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: "10px",
    width: "100%",
  },
  passwordGridContainer: {
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginTop: "10px",
    },
  },
  passwordTitle: {
    color: "white",
    alignSelf: "flex-start",
    fontSize: "large",
    marginLeft: "5px",
    marginBottom: "3px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
      marginLeft: "8px",
    },
    fontWeight: "bold",
  },
  text: {
    fontSize: "medium",
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
    padding: 0,
  },
  hide: {
    display: "none",
  },
  emailSuccess: {
    color: theme.palette.secondary.main,
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
    color: "white",
    borderRadius: "4px",
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    "&:hover": {
      backgroundColor: theme.palette.paperBackground.onPageLight,
    },
    "&:focus": {
      backgroundColor: theme.palette.paperBackground.onPageLight,
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

  sendVerificationCodeButton = () => {
    getUserData("default", this.email.toLowerCase())
      .then((user) => {
        return user ? null : sendVerificationCode(this.email.toLowerCase(), "email");
      })
      .then((emailSent) => {
        this.setState({
          emailSuccess: emailSent
            ? this.props.t("settings.emailSuccess")
            : "",
          emailError: emailSent
            ? ""
            : this.props.t("settings.emailError"),
        });
      })
      .catch((err) => {
        this.setState({ emailSuccess: "", emailError: err });
      });
  };

  confirmVerificationCode = () => {
    checkVerificationCode(this.email.toLowerCase(), this.state.verificationCode, "email")
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
              this.email.toLowerCase(),
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

  componentDidMount() {
    this.props.reference.current = this;
  }

  componentWillUnmount() {
    this.props.reference.current = null;
  }

  render() {
    const { t, classes, email } = this.props;
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
                onClick={this.sendVerificationCodeButton}
              >
                {t("settings.sendVerification")}
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
                {t("general.confirm")}
              </Button>
            </Container>
          </Grid>

          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={classes.passwordTitle}>
              {t("general.Password")}
            </Typography>
            <PasswordAccordion expanded={show} onChange={this.toggle}>
              <PasswordAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="password-section"
              >
                <Typography className={classes.text}>
                  {t("settings.changePassword")}
                </Typography>
              </PasswordAccordionSummary>
              <AccordionDetails className={classes.fullWidth}>
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
                      name={t("settings.currentPassword")}
                      isInvalid={wrongPassword}
                      helper={t("settings.incorrectPassword")}
                      onChange={this.checkOldPassword}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.itemGrid}>
                    <SettingPasswordTextField
                      value={input.newPassword}
                      name={t("settings.newPassword")}
                      isInvalid={invalidPassword}
                      helper={t("settings.invalidPassword")}
                      onChange={this.recordNewPassword}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.itemGrid}>
                    <SettingPasswordTextField
                      value={input.confirmedPassword}
                      name={t("settings.confirmPassword")}
                      isInvalid={unmatchedPassword}
                      helper={t("settings.unmatchPassword")}
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

export default withTranslation()(
  withStyles(styles)(SensitiveSection)
);
