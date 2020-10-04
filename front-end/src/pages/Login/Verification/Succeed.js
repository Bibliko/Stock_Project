import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import {
  shouldRedirectToLandingPage,
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
  },
  title: {
    fontSize: "large",
    color: theme.palette.succeed.main,
  },
  avatar: {
    height: "130px",
    width: "130px",
    marginBottom: "10px",
  },
  succeedIcon: {
    height: "100px",
    width: "100px",
    color: theme.palette.succeed.main,
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
    if (shouldRedirectToLandingPage(this.props)) {
      redirectToPage("/", this.props);
    }
  }

  componentDidUpdate() {
    console.log(this.props.userSession);
    if (shouldRedirectToLandingPage(this.props)) {
      redirectToPage("/", this.props);
    }
  }

  render() {
    const { classes } = this.props;

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
                  src="/bibOfficial.jpg"
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
                  Email Verified Successfully
                </Typography>
              </Grid>
              <Grid item className={classes.center}>
                <Typography>Redirecting to Home Page...</Typography>
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
)(withStyles(styles)(withRouter(Succeed)));
