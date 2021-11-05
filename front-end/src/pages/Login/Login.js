import React from "react";
import clsx from "clsx";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";

import { withTranslation } from "react-i18next";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";
import {
  shouldRedirectToHomePage,
  redirectToPage,
} from "../../utils/low-dependency/PageRedirectUtil";
import { getUser, loginUser } from "../../utils/UserUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";
import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";

import NormalTextField from "../../components/TextField/AuthenticationTextFields/NormalTextField";
import PasswordTextField from "../../components/TextField/AuthenticationTextFields/PasswordTextField";

import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Container,
  ClickAwayListener,
} from "@material-ui/core";

const styles = (theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    position: "absolute",
    width: "100vw",
    maxWidth: "none",
    minHeight: "max(605px, 100vh)",
    overflow: "hidden",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      overflowY: "auto",
    },
  },
  hero: {
    boxSizing: "border-box",
    flex: "1 1 50%",
    padding: "0px 5%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    [theme.breakpoints.down("xs")]: {
      display: "unset",
      minHeight: "max(600px, 100vh)",
      padding: "20% 10%",
    },
  },
  logo: {
    height: "70px",
    marginLeft: "-8px",
  },
  title: {
    color: "white",
    letterSpacing: "0.02em",
    margin: "0.5em 0px",
    fontSize: "xxx-large",
    fontWeight: "bolder",
    lineHeight: "1.1",
  },
  description: {
    color: "white",
    opacity: "0.6",
    fontSize: "1.38em",
    lineHeight: "1.4",
    maxWidth: "50ch",
    [theme.breakpoints.down("xs")]: {
      fontSize: "larger",
    },
  },
  button: {
    color: "white",
    marginTop: "2em",
    fontSize: "large",
    letterSpacing: "0.01em",
    background: theme.palette.primary.transparent,
    "&:hover": {
      background: theme.palette.primary.transparentHover,
    },
  },
  paper: {
    boxSizing: "border-box",
    flex: "1 1 50%",
    padding: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: theme.palette.gradientPaper.main,
    [theme.breakpoints.down("xs")]: {
      minHeight: "max(600px, 100vh)",
    },
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
  submit: {
    marginTop: "8px",
    padding: theme.spacing(1),
    height: "40px",
    width: "120px",
    borderRadius: "40px",
    color: "white",
    fontWeight: "bold",
    backgroundColor: theme.palette.submitButton.main,
    "&:hover": {
      backgroundColor: theme.palette.submitButton.main,
      opacity: 0.8,
    },
    "& .MuiTouchRipple-root span": {
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
  },
  link: {
    color: theme.palette.loginLink.main,
    fontWeight: "bold",
    fontSize: "small",
  },
  image: {
    borderRadius: "50%",
    height: "40px",
    width: "40px",
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
  orLogInWith: {
    marginTop: 0,
    fontWeight: "normal",
    color: theme.palette.loginLink.main,
    fontSize: "15px",
  },
  error: {
    marginTop: "5px",
    display: "flex",
    justifyContent: "center",
    minHeight: "30px",
  },
  errorText: {
    fontSize: "medium",
    fontWeight: "bold",
    color: theme.palette.fail.main,
  },
  input: {
    color: "black",
    backgroundColor: "rgba(225,225,225,0.65)",
    "&:hover": {
      backgroundColor: "rgba(225,225,225,0.5)",
    },
  },
  textField: {
    width: "100%",
    height: 50,
    marginTop: 5,
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
  form: {
    flexDirection: "column",
    gap: "8px",
  },
  dividerLine: {
    backgroundColor: theme.palette.loginLink.main,
  },
});

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
    };

    this.formRef = React.createRef();

    this.errorTypes = [this.props.t("login.missingField")];

    this.email = "";
    this.password = "";
    // remember=false
  }

  changeEmail = (event) => {
    this.email = event.target.value;
    if (!isEmpty(this.state.error)) {
      this.setState({ error: "" });
    }
  };

  changePassword = (event) => {
    this.password = event.target.value;
    if (!isEmpty(this.state.error)) {
      this.setState({ error: "" });
    }
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      this.submit();
    }
  };

  submit = () => {
    if (isEmpty(this.email) || isEmpty(this.password)) {
      this.setState({ error: this.errorTypes[0] });
    } else {
      if (isEmpty(this.state.error)) {
        loginUser("local", {
          email: this.email.toLowerCase(),
          password: this.password,
          // remember: this.remember
        })
          .then(() => {
            return getUser();
          })
          .then((user) => {
            this.props.mutateUser(user.data);
          })
          .catch((err) => {
            this.setState({ error: err });
          });
      }
    }
  };

  scrollToForm = () => {
    setTimeout(
      () => this.formRef.current?.scrollIntoView({ behavior: 'smooth' }),
      oneSecond * 0.2
    );
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
    const { t, classes, mediaQuery } = this.props;
    const { error } = this.state;

    if (shouldRedirectToHomePage(this.props)) {
      return null;
    }

    return (
      <div>
        <div className={classes.div} />
        <Container className={classes.root} disableGutters>
          <div className={classes.hero}>
            <img
              src="/bibliko.png"
              alt="Bibliko logo"
              className={classes.logo}
            />
            <Typography className={classes.title}>
              {t("login.title")}
            </Typography>
            <Typography className={classes.description}>
              {t("login.description")}
            </Typography>
            { mediaQuery &&
              <Button
                aria-label="Let's get started"
                variant="outlined"
                color="primary"
                className={classes.button}
                onClick={() => this.scrollToForm()}
              >
                {t("login.getStarted")}
              </Button>
            }
          </div>
          <Paper className={classes.paper} elevation={2} ref={this.formRef}>
            <Grid
              container
              spacing={2}
              direction="column"
              className={classes.center}
            >
              { mediaQuery ? null :
                <Grid item xs className={classes.center}>
                  <Typography
                    className={classes.title}
                    style={{textAlign: "center"}}
                  >
                    {t("login.getStarted")}
                  </Typography>
                </Grid>
              }
              <Grid
                container
                spacing={1}
                direction="column"
                item
                xs
                className={classes.center}
              >
                <ClickAwayListener
                  onClickAway={() => {
                    if (mediaQuery)
                      this.scrollToForm();
                  }}
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
                      createOrLogin="login"
                    />
                  </form>
                </ClickAwayListener>
                {!isEmpty(error) && (
                  <Grid item xs className={classes.error}>
                    <Typography align="center" className={classes.errorText}>
                      {`${t("general.error")}: ${error}`}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs className={classes.center}>
                  <Button
                    className={classes.submit}
                    onClick={() => {
                      this.submit();
                      if (mediaQuery)
                        this.scrollToForm();
                    }}
                  >
                    {t("login.logIn")}
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs className={classes.center}>
                <Button
                  color="primary"
                  onClick={() => {
                    redirectToPage("/signup", this.props);
                  }}
                  className={classes.link}
                  disableRipple
                >
                  {t("login.createAccount")}
                </Button>
                <Divider
                  orientation="vertical"
                  flexItem
                  className={classes.dividerLine}
                />
                <Button
                  color="primary"
                  onClick={() => {
                    redirectToPage("/forgotpassword", this.props);
                  }}
                  className={classes.link}
                  disableRipple
                >
                  {t("login.forgotPassword")}
                </Button>
              </Grid>
              <Grid
                container
                spacing={1}
                direction="column"
                item
                xs
                className={classes.center}
              >
                <Grid item xs className={classes.center}>
                  <Typography className={classes.orLogInWith}>
                    {t("login.loginWith")}
                  </Typography>
                </Grid>
                <Grid item xs className={classes.center}>
                  <Button
                    onClick={() => {
                      loginUser("google");
                    }}
                    classes={{
                      root: classes.alternativeLoginButton,
                    }}
                  >
                    <img
                      src="/google-logo-png-open-480.png"
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

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withTranslation()(
    withStyles(styles)(
      withRouter(
        withMediaQuery("(max-width:600px)")(Login)
      )
    )
  )
);
