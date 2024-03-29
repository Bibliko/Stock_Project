import React from "react";
import clsx from "clsx";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import { withTranslation } from "react-i18next";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";
import RankingPaper from "../../components/Paper/HomePage/RankingPaper";
import MarketWatchPaper from "../../components/Paper/HomePage/MarketWatch";
import MostGainersPaper from "../../components/Paper/HomePage/MostGainers";
import AccountSummaryPaper from "../../components/Paper/HomePage/AccountSummary";

import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid, Paper, Typography } from "@material-ui/core";

import { SettingsRounded as SettingsRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  root: {
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
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
  },
  paperColor: {
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  itemGrid: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "125px",
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
    "0%": { transform: "rotate(0deg)" },
    "60%": { transform: "rotate(359deg)" },
    "100%": { transform: "rotate(359deg)" },
  },
  accountSettingIconAnimation: {
    animation: "5s infinite $rotateAccountSetting",
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
  welcome: {
    fontSize: "xx-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "x-large",
    },
    alignSelf: "flex-start",
    marginBottom: "40px",
    marginLeft: "32px",
    fontWeight: "bolder",
    background: theme.palette.gradient.main,
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  },
});

class HomePage extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["t", "classes", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return !isEqual(nextPropsCompare, propsCompare);
  }

  render() {
    const { t, classes, userSession } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Typography className={classes.welcome}>
          {t("homepage.greeting")}
        </Typography>
        {!userSession.hasFinishedSettingUp && (
          <Paper
            className={classes.paperRedirectingToAccountSetting}
            elevation={2}
            onClick={() => {
              redirectToPage("/setting", this.props);
            }}
          >
            <SettingsRoundedIcon
              className={clsx(
                classes.accountSettingIcon,
                classes.accountSettingIconAnimation
              )}
            />
            <Typography className={classes.accountSettingWords}>
              {t("homepage.setupAccount")}
            </Typography>
          </Paper>
        )}
        {userSession.hasFinishedSettingUp && (
          <Grid
            container
            spacing={8}
            direction="row"
            className={classes.fullHeightWidth}
          >
            <Grid
              item
              xs={12}
              md={7}
              className={clsx(classes.itemGrid, classes.largeMarginBottom)}
            >
              <MarketWatchPaper />
            </Grid>

            <Grid item xs={12} md={5} className={classes.itemGrid}>
              <MostGainersPaper title={t("homepage.mostGainers")} />
            </Grid>

            <Grid
              container item
              xs={12} sm={6} md={7}
              className={classes.itemGrid}
              style={{flexDirection: "row"}}
            >
              <AccountSummaryPaper />
            </Grid>

            <Grid item xs={12} sm={6} md={5} className={classes.itemGrid}>
              <RankingPaper />
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
  withTranslation()(
    withStyles(styles)(withRouter(HomePage))
  )
);
