import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";
import MarketWatchPaper from "../../components/Paper/LandingPage/MarketWatch";

import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid, Paper, Typography } from "@material-ui/core";

import { SettingsRounded as SettingsRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: "none",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    flexBasis: "unset",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    minHeight: "200px",
    padding: "24px",
  },
  paperColor: {
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "125px",
    //maxHeight: '300px'
  },
  gridTitle: {
    fontSize: "large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "small",
    },
    fontWeight: "bold",
    marginBottom: "5px",
  },
  marketWatch: {
    color: "#FF3747",
  },
  stocksOnTheMove: {
    color: "#74E0EF",
  },
  accountSummary: {
    color: "#F2C94C",
  },
  rankings: {
    color: "#9ED2EF",
  },
  paperRedirectingToAccountSetting: {
    height: theme.customHeight.redirectingPaper,
    width: theme.customWidth.redirectingPaper,
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: theme.palette.paperBackground.onPage,
    "&:hover": {
      cursor: "pointer",
    },
    marginTop: "20px",
  },
  accountSettingIcon: {
    width: "50px",
    height: "50px",
    color: "white",
    marginRight: "10px",
  },
  "@keyframes rotateAccountSetting": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(359deg)" },
  },
  accountSettingIconAnimation: {
    animation: "2.5s infinite $rotateAccountSetting",
  },
  accountSettingWords: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    textAlign: "center",
  },
  largeMarginBottom: {
    marginBottom: "40px",
  },
});

class LandingPage extends React.Component {
  state = {
    hoverPaperAccountSetting: false,
  };

  hoverPaper = () => {
    this.setState({
      hoverPaperAccountSetting: true,
    });
  };

  notHoverPaper = () => {
    this.setState({
      hoverPaperAccountSetting: false,
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.userSession, this.props.userSession) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, userSession } = this.props;
    const { hoverPaperAccountSetting } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        {!userSession.hasFinishedSettingUp && (
          <Paper
            className={classes.paperRedirectingToAccountSetting}
            elevation={2}
            onClick={() => {
              redirectToPage("/setting", this.props);
            }}
            onMouseEnter={this.hoverPaper}
            onMouseLeave={this.notHoverPaper}
          >
            <SettingsRoundedIcon
              className={clsx(classes.accountSettingIcon, {
                [classes.accountSettingIconAnimation]: hoverPaperAccountSetting,
              })}
            />
            <Typography className={classes.accountSettingWords}>
              Setup Your Account Now To Start!
            </Typography>
          </Paper>
        )}
        {userSession.hasFinishedSettingUp && (
          <Grid
            container
            spacing={6}
            direction="row"
            className={classes.fullHeightWidth}
          >
            <Grid
              item
              xs={12}
              sm={12}
              className={clsx(classes.itemGrid, classes.largeMarginBottom)}
            >
              <Typography
                className={clsx(classes.gridTitle, classes.marketWatch)}
              >
                MARKET WATCH
              </Typography>
              <MarketWatchPaper />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.itemGrid}>
              <Typography
                className={clsx(classes.gridTitle, classes.stocksOnTheMove)}
              >
                STOCKS ON THE MOVE
              </Typography>
              <Paper
                className={clsx(classes.fullHeightWidth, classes.paperColor)}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.itemGrid}>
              <Typography
                className={clsx(classes.gridTitle, classes.accountSummary)}
              >
                ACCOUNT SUMMARY
              </Typography>
              <Paper
                className={clsx(classes.fullHeightWidth, classes.paperColor)}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.itemGrid}>
              <Typography className={clsx(classes.gridTitle, classes.rankings)}>
                RANKINGS
              </Typography>
              <Paper
                className={clsx(classes.fullHeightWidth, classes.paperColor)}
              />
            </Grid>
            <SpaceDivMainPages />
          </Grid>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(LandingPage))
);
