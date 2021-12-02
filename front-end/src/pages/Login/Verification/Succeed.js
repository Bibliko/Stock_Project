import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { withTranslation } from "react-i18next";

import {
  shouldRedirectToHomePage,
  redirectToPage,
} from "../../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Grid, Container } from "@material-ui/core";

import { CheckCircleOutlineRounded as CheckCircleOutlineRoundedIcon } from "@material-ui/icons";

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
    color: theme.palette.secondary.main,
  },
  avatar: {
    height: "130px",
    width: "130px",
    marginBottom: "10px",
  },
  succeedIcon: {
    height: "100px",
    width: "100px",
    color: theme.palette.secondary.main,
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
});

class Succeed extends React.Component {
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
                <CheckCircleOutlineRoundedIcon
                  className={classes.succeedIcon}
                />
                <Typography className={classes.title}>
                  {t("login.verificationSuccess")}
                </Typography>
              </Grid>
              <Grid item className={classes.center}>
                <Typography>
                  {t("login.redirect")}
                </Typography>
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
    withStyles(styles)(withRouter(Succeed))
  )
);
