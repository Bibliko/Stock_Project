import React from "react";
import clsx from "clsx";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import {
  shouldRedirectToLandingPage,
  redirectToPage,
} from "../../utils/low-dependency/PageRedirectUtil";
import {
  loginUser,
  sendPasswordVerificationCode,
  checkPasswordVerificationCode,
  changePassword,
} from "../../utils/UserUtil";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import PasswordTextField from "../../components/TextField/PasswordTextField";
import NormalTextField from "../../components/TextField/NormalTextField";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "none",
    minHeight: "610px",
  },
  paper: {
    height: "fit-content",
    width: "fit-content",
    minWidth: "450px",
    [theme.breakpoints.down("xs")]: {
      height: "-webkit-fill-available",
      width: "-webkit-fill-available",
      minWidth: 0,
    },
    padding: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: theme.palette.gradientPaper.main,
  },
  div: {
    backgroundColor: "black",
    backgroundSize: "cover",
    height: "100vh",
    width: "100vw",
    position: "fixed",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    flexBasis: "unset",
    flexGrow: 0,
  },
  textFieldGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexBasis: "unset",
    flexGrow: 0,
  },
  mainGridOfPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    margin: "5px",
    flexBasis: "unset",
    flexGrow: 0,
  },
  instruction: {
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: "50%",
    height: "40px",
    width: "40px",
  },
  avatar: {
    height: "130px",
    width: "130px",
    marginBottom: "10px",
  },
  announcementText: {
    fontSize: "small",
  },
  successText: {
    fontSize: "small",
    color: theme.palette.succeed.main,
  },
  successTextLarge: {
    fontSize: "large",
    fontWeight: "bold",
  },
  orLogInWith: {
    fontWeight: "lighter",
    color: theme.palette.subText.main,
  },
  alternativeLoginButton: {
    maxHeight: "fit-content",
    maxWidth: "fit-content",
    padding: 0,
    minWidth: 0,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: "50%",
  },
  backToLoginText: {
    fontSize: "15px",
    fontWeight: "600",
  },
  buttonStyles: {
    marginTop: "4px",
    padding: theme.spacing(1),
    height: "40px",
    width: "120px",
    background: "black",
    "&:hover": {
      backgroundColor: "black",
      opacity: 0.8,
    },
    borderRadius: "40px",
    color: "white",
    fontWeight: "bold",
  },
});

class ForgotPassword extends React.Component {
  state = {
    error: "",
    success: "",
    allowButtonSendCode: true,
    allowCode: false,
    allowPassword: false,
  };

  errorTypes = [
    "Confirm Password does not match Password.",
    "Missing some fields",
  ];

  email = "";
  code = "";
  password = "";
  confirmPassword = "";

  clearSuccessAndError = () => {
    if (!isEmpty(this.state.error)) {
      this.setState({
        error: "",
      });
    }
    if (!isEmpty(this.state.success)) {
      this.setState({
        success: "",
      });
    }
  };

  changeEmail = (event) => {
    this.email = event.target.value;
    this.clearSuccessAndError();
  };

  changeCode = (event) => {
    this.code = event.target.value;
    this.clearSuccessAndError();
  };

  changePassword = (event) => {
    this.password = event.target.value;
    this.clearSuccessAndError();
  };

  changeConfirmPassword = (event) => {
    this.confirmPassword = event.target.value;

    if (!isEqual(this.password, this.confirmPassword)) {
      if (!isEqual(this.state.error, this.errorTypes[0])) {
        this.setState({ error: this.errorTypes[0] });
      }
    } else {
      this.setState({ error: "" });
    }
  };

  sendCode = () => {
    if (isEmpty(this.email)) {
      this.setState({
        error: this.errorTypes[1],
      });
    } else {
      sendPasswordVerificationCode(this.email)
        .then(() => {
          this.setState({
            success: "Password Verification Code has been sent",
            error: "",
            allowCode: true,
          });
        })
        .catch((err) => {
          this.setState({ error: err });
        });
    }
  };

  verifyCode = () => {
    this.setState({ success: "" });
    if (isEmpty(this.code)) {
      this.setState({
        error: this.errorTypes[1],
      });
    } else {
      checkPasswordVerificationCode(this.email, this.code)
        .then(() => {
          this.setState({
            allowButtonSendCode: false,
            allowCode: false,
            allowPassword: true,
          });
        })
        .catch((err) => {
          this.setState({
            error: err,
          });
        });
    }
  };

  submit = () => {
    if (
      isEmpty(this.email) ||
      isEmpty(this.password) ||
      isEmpty(this.confirmPassword)
    ) {
      this.setState({ error: this.errorTypes[1] });
    } else {
      changePassword(this.password, this.email)
        .then((res) => {
          this.setState({ success: "Successfully changed password" });
        })
        .catch((err) => {
          this.setState({ error: err });
        });
    }
  };

  enterEmail = (event) => {
    if (event.key === "Enter") {
      this.sendCode();
    }
  };

  enterCode = (event) => {
    if (event.key === "Enter") {
      this.verifyCode();
    }
  };

  enterPassword = (event) => {
    if (event.key === "Enter") {
      this.submit();
    }
  };

  shouldShowSuccessOnly = () => {
    const { success, error } = this.state;
    return (
      !isEmpty(success) &&
      isEqual(success, "Successfully changed password") &&
      isEmpty(error)
    );
  };

  componentDidMount() {
    if (shouldRedirectToLandingPage(this.props)) {
      redirectToPage("/", this.props);
    }
  }

  componentDidUpdate() {
    if (shouldRedirectToLandingPage(this.props)) {
      redirectToPage("/", this.props);
    }
  }

  render() {
    const { classes } = this.props;
    const {
      allowButtonSendCode,
      allowCode,
      allowPassword,
      success,
      error,
    } = this.state;

    if (shouldRedirectToLandingPage(this.props)) {
      return null;
    }

    return (
      <div>
        <div className={classes.div} />
        <Container className={classes.root} disableGutters>
          <Paper className={classes.paper} elevation={2}>
            <Grid
              container
              spacing={1}
              direction="column"
              className={classes.center}
            >
              <img
                className={classes.avatar}
                src="/bibOfficial.jpg"
                alt="Bibliko"
              />
              {!this.shouldShowSuccessOnly() && (
                <Typography className={classes.instruction}>
                  Please enter your email and we’ll send you a code.
                </Typography>
              )}
              {!this.shouldShowSuccessOnly() && (
                <Grid
                  item
                  xs
                  container
                  direction="column"
                  className={classes.mainGridOfPaper}
                >
                  <Grid
                    item
                    xs
                    className={classes.textFieldGrid}
                    container
                    direction="column"
                  >
                    <NormalTextField
                      name="Email"
                      changeData={this.changeEmail}
                      enterData={this.enterEmail}
                    />
                    {allowButtonSendCode && (
                      <Button
                        onClick={this.sendCode}
                        className={classes.buttonStyles}
                      >
                        Send
                      </Button>
                    )}
                  </Grid>
                  {allowCode && (
                    <Grid
                      item
                      xs
                      className={classes.textFieldGrid}
                      container
                      direction="column"
                    >
                      <NormalTextField
                        name="Code"
                        changeData={this.changeCode}
                        enterData={this.enterCode}
                      />
                      <Button
                        onClick={this.verifyCode}
                        className={classes.buttonStyles}
                      >
                        Confirm
                      </Button>
                    </Grid>
                  )}
                  {allowPassword && (
                    <Grid
                      item
                      xs
                      container
                      direction="column"
                      className={classes.textFieldGrid}
                    >
                      <PasswordTextField
                        name="Password"
                        changePassword={this.changePassword}
                        enterPassword={this.enterPassword}
                      />
                      <PasswordTextField
                        name="Confirm Password"
                        changePassword={this.changeConfirmPassword}
                        enterPassword={this.enterPassword}
                      />
                      <Button
                        onClick={this.submit}
                        className={classes.buttonStyles}
                      >
                        Submit
                      </Button>
                    </Grid>
                  )}
                </Grid>
              )}
              {!isEmpty(error) && (
                <Grid item xs className={classes.center}>
                  <Typography
                    color="error"
                    align="center"
                    className={classes.announcementText}
                  >
                    Error: {error}
                  </Typography>
                </Grid>
              )}
              {!isEmpty(success) && isEmpty(error) && (
                <Grid item xs className={classes.center}>
                  <Typography
                    align="center"
                    className={clsx(classes.successText, {
                      [classes.successTextLarge]: this.shouldShowSuccessOnly(),
                    })}
                  >
                    Success: {success}
                  </Typography>
                </Grid>
              )}
              <Grid
                container
                spacing={1}
                direction="column"
                item
                xs
                className={classes.center}
              >
                <Grid item xs className={classes.center}>
                  <Button
                    classes={{
                      root: classes.backToLoginText,
                    }}
                    onClick={() => {
                      redirectToPage("/login", this.props);
                    }}
                  >
                    Login
                  </Button>
                </Grid>
                <Grid item xs className={classes.center}>
                  <Typography className={classes.orLogInWith}>
                    or login with
                  </Typography>
                </Grid>
                <Grid item xs className={classes.center}>
                  <Button //Google icon swap with Facebook icon
                    onClick={() => {
                      loginUser("google");
                    }}
                    classes={{
                      root: classes.alternativeLoginButton,
                    }}
                  >
                    <img
                      src="/google-logo-png-open-2000.png" //change the logo to fit with the background
                      alt="google"
                      className={classes.image}
                    />
                  </Button>
                  <Button
                    onClick={() => {
                      loginUser("facebook");
                    }}
                    classes={{
                      root: classes.alternativeLoginButton,
                    }}
                  >
                    <img
                      src="/facebook.png"
                      alt="facebook"
                      className={classes.image}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(ForgotPassword))
);
