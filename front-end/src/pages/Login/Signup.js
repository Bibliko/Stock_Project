import React from "react";
import clsx from "clsx";
import validator from "email-validator";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { withTranslation } from "react-i18next";

import {
  shouldRedirectToHomePage,
  redirectToPage,
} from "../../utils/low-dependency/PageRedirectUtil";
import { signupUser } from "../../utils/UserUtil";

import NormalTextField from "../../components/TextField/AuthenticationTextFields/NormalTextField";
import PasswordTextField from "../../components/TextField/AuthenticationTextFields/PasswordTextField";

import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button, Grid, Container } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "none",
    minHeight: "605px",
    overflowX: "hidden",
  },
  paper: {
    height: "fit-content",
    minHeight: "550px",
    width: "fit-content",
    minWidth: "450px",
    [theme.breakpoints.down("xs")]: {
      height: "100%",
      width: "100%",
      minWidth: 0,
    },
    padding: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: theme.palette.gradientPaper.main,
  },
  div: {
    backgroundColor: theme.palette.loginBackground.main,
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
  },
  title: {
    fontSize: "x-large",
    fontWeight: "bold",
  },
  avatar: {
    height: "130px",
    width: "130px",
    margin: theme.spacing(3),
  },
  submit: {
    marginTop: "10px",
    padding: theme.spacing(1),
    height: "40px",
    width: "120px",
    background: theme.palette.submitButton.main,
    "&:hover": {
      backgroundColor: theme.palette.submitButton.main,
      opacity: 0.8,
    },
    borderRadius: "40px",
    color: "white",
    fontWeight: "bold",
  },
  link: {
    marginTop: "6px",
    backgroundColor: "transparent",
    color: theme.palette.loginLink.main,
    fontWeight: "bold",
    textTransform: "none",
    fontSize: "16px",
  },
  announcement: {
    marginTop: 5,
    display: "flex",
    justifyContent: "center",
    minHeight: "30px",
  },
  announcementText: {
    fontSize: "medium",
    fontWeight: "bold",
    color: theme.palette.fail.main,
  },
  successText: {
    fontSize: "medium",
    fontWeight: "bold",
    color: theme.palette.secondary.main,
  },
  form: {
    flexDirection: "column",
    marginBottom: "10px",
  },
});

class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      success: "",
    };

    const { t } = this.props;

    this.errorTypes = [
      t("login.confirmPasswordNotMatch"),
      t("login.missingFields"),
      t("login.invalidEmail"),
    ];

    this.email = "";
    this.password = "";
    this.confirmPassword = "";
  }

  setStateError = () => {
    if (!validator.validate(this.email)) {
      this.setState({ error: this.errorTypes[2] });
    } else if (!isEqual(this.password, this.confirmPassword)) {
      if (!isEqual(this.state.error, this.errorTypes[0])) {
        this.setState({ error: this.errorTypes[0] });
      }
    } else {
      if (!isEmpty(this.state.error)) {
        this.setState({ error: "" });
      }
    }
  };

  changeEmail = (event) => {
    this.email = event.target.value;
    this.setStateError();
  };

  changePassword = (event) => {
    this.password = event.target.value;
    this.setStateError();
  };

  changeConfirmPassword = (event) => {
    this.confirmPassword = event.target.value;
    this.setStateError();
  };

  submit = () => {
    if (
      isEmpty(this.email) ||
      isEmpty(this.password) ||
      isEmpty(this.confirmPassword)
    ) {
      this.setState({ error: this.errorTypes[1] });
    } else {
      if (isEmpty(this.state.error)) {
        signupUser({
          email: this.email.toLowerCase(),
          password: this.password,
        })
          .then((res) => {
            this.setState({ success: this.props.t("login." + res) });
          })
          .catch((err) => {
            this.setState({ error: this.props.t("login." + err, err) });
          });
      }
    }
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      this.submit();
    }
  };

  componentDidMount() {
    if (shouldRedirectToHomePage(this.props)) {
      redirectToPage("/", this.props);
    }
  }

  componentDidUpdate() {
    if (shouldRedirectToHomePage(this.props)) {
      redirectToPage("/", this.props);
    }
  }

  render() {
    const { t, classes } = this.props;

    const { error, success } = this.state;

    if (shouldRedirectToHomePage(this.props)) {
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
              <Grid item xs className={classes.center}>
                <img
                  src="/bibOfficial.png"
                  alt="Bibliko"
                  className={classes.avatar}
                />
              </Grid>
              <Grid
                container
                spacing={2}
                direction="column"
                item
                xs
                className={classes.center}
              >
                <form
                  className={clsx(classes.center, classes.form)}
                  noValidate
                  autoComplete="on"
                >
                  <NormalTextField
                    name="Email"
                    changeData={this.changeEmail}
                    enterData={this.handleKeyDown}
                  />
                  <PasswordTextField
                    name="Password"
                    changePassword={this.changePassword}
                    enterPassword={this.handleKeyDown}
                    createOrLogin="create"
                  />
                  <PasswordTextField
                    name="Confirm Password"
                    changePassword={this.changeConfirmPassword}
                    enterPassword={this.handleKeyDown}
                    createOrLogin="create"
                  />
                </form>

                {!isEmpty(error) && (
                  <Grid item xs className={classes.announcement}>
                    <Typography
                      align="center"
                      className={classes.announcementText}
                    >
                      {`${t("general.error")}: ${error}`}
                    </Typography>
                  </Grid>
                )}
                {!isEmpty(success) && (
                  <Grid item xs className={classes.announcement}>
                    <Typography align="center" className={classes.successText}>
                      {`${t("general.success")}: ${success}`}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs className={classes.center}>
                  <Button className={classes.submit} onClick={this.submit}>
                    {t("login.signUp")}
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      redirectToPage("/login", this.props);
                    }}
                    className={classes.link}
                    disableRipple
                  >
                    {t("login.backToLogin")}
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
  withTranslation()(
    withStyles(styles)(withRouter(Signup))
  )
);
