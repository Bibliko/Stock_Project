import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { withTranslation } from "react-i18next";

import {
  shouldRedirectToHomePage,
  redirectToPage,
} from "../../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button, Grid, Container } from "@material-ui/core";

import { HighlightOffRounded as HighlightOffRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "none",
    minHeight: "410px",
    overflowX: "hidden",
  },
  paper: {
    height: "fit-content",
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
    fontSize: "large",
    fontWeight: "bold",
    color: theme.palette.fail.main,
  },
  avatar: {
    height: "130px",
    width: "130px",
    marginBottom: "10px",
  },
  failIcon: {
    height: "100px",
    width: "100px",
    color: theme.palette.fail.main,
  },
  mainGridOfPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    marginTop: "10px",
    marginBottom: "20px",
    flexBasis: "unset",
  },
  backToLoginText: {
    fontSize: "15px",
    fontWeight: "600",
    color: theme.palette.loginLink.main,
  },
});

class Fail extends React.Component {
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
              spacing={2}
              direction="column"
              className={classes.mainGridOfPaper}
            >
              <Grid item xs className={classes.center}>
                <img
                  src="/bibOfficial.png"
                  alt="Bibliko"
                  className={classes.avatar}
                />
              </Grid>
              <Grid
                item
                xs
                className={classes.center}
                container
                direction="column"
              >
                <HighlightOffRoundedIcon className={classes.failIcon} />
                <Typography color="error" className={classes.title}>
                  {t("login.verificationFailed")}
                </Typography>
              </Grid>
              <Grid item xs className={classes.center}>
                <Button
                  classes={{
                    root: classes.backToLoginText,
                  }}
                  onClick={() => {
                    redirectToPage("/login", this.props);
                  }}
                >
                  {t("login.backToLogin")}
                </Button>
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
    withStyles(styles)(withRouter(Fail))
  )
);
