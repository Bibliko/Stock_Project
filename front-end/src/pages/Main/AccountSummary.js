import React from "react";
import clsx from "clsx";
import { isEqual, isEmpty } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { getParsedCachedSharesList } from "../../utils/RedisUtil";
import { numberWithCommas } from "../../utils/NumberUtil";

import HoldingsTableContainer from "../../components/Table/AccountSummaryTable/HoldingsTableContainer";
import SummaryTableContainer from "../../components/Table/AccountSummaryTable/SummaryTableContainer";
import AccountSummaryChart from "../../components/Chart/AccountSummaryChart";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";

import StorefrontRoundedIcon from "@material-ui/icons/StorefrontRounded";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    marginBottom: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
      marginBottom: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
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
    padding: "24px",
  },
  itemContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "125px",
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 24,
    paddingTop: 24,
  },
  gridTitle: {
    fontSize: "x-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "10px",
  },
  summary: {
    color: "#DC3D4A",
  },
  holdings: {
    color: "#9ED2EF",
  },
  portfolioChart: {
    color: "#2F80ED",
  },
  paperAccountSummary: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "200px",
    width: "100%",
    color: "white",
    padding: 20,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  storeIcon: {
    height: "50px",
    width: "auto",
    marginBottom: "5px",
    [theme.breakpoints.down("xs")]: {
      height: "40px",
    },
  },
  holdingsText: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    textAlign: "center",
  },
  titleChart: {
    fontSize: "x-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    color: "white",
    fontWeight: "bold",
  },
  subtitleChart: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    color: "white",
  },
});

class AccountSummary extends React.Component {
  state = {
    userShares: [],
    holdingsRows: [],
  };

  createHoldingData = (id, code, holding, buyPriceAvg) => {
    return { id, code, holding, buyPriceAvg };
  };

  updateHoldingsTable = () => {
    var holdingsRows = [];

    for (let share of this.state.userShares) {
      holdingsRows.push(
        this.createHoldingData(
          share.id,
          share.companyCode,
          share.quantity,
          share.buyPriceAvg
        )
      );
    }

    if (!isEqual(this.state.holdingsRows, holdingsRows)) {
      this.setState({
        holdingsRows,
      });
    }
  };

  componentDidMount() {
    console.log(this.props.userSession);
    getParsedCachedSharesList(this.props.userSession.email)
      .then((shares) => {
        this.setState(
          {
            userShares: shares,
          },
          () => {
            this.updateHoldingsTable();
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidUpdate() {
    // console.log("updateAccountSummary");
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.userSession, this.props.userSession) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    const {
      cash,
      totalPortfolio,
      totalPortfolioLastClosure,
      ranking,
      email,
    } = this.props.userSession;

    const userDailyChange = totalPortfolio - totalPortfolioLastClosure;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={6}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Container className={classes.itemContainer}>
            <Typography className={clsx(classes.gridTitle, classes.summary)}>
              Summary
            </Typography>
            <SummaryTableContainer
              cash={cash.toFixed(2)}
              totalPortfolio={totalPortfolio.toFixed(2)}
              ranking={ranking}
              userDailyChange={userDailyChange.toFixed(2)}
            />
          </Container>
          <Container className={classes.itemContainer}>
            <Typography className={clsx(classes.gridTitle, classes.holdings)}>
              Holdings
            </Typography>
            {isEmpty(this.state.holdingsRows) && (
              <Paper className={classes.paperAccountSummary} elevation={2}>
                <StorefrontRoundedIcon className={classes.storeIcon} />
                <Typography className={classes.holdingsText}>
                  Start by buying some stocks!
                </Typography>
              </Paper>
            )}
            {!isEmpty(this.state.holdingsRows) && (
              <HoldingsTableContainer rows={this.state.holdingsRows} />
            )}
          </Container>
          <Container className={classes.itemContainer}>
            <Typography
              className={clsx(classes.gridTitle, classes.portfolioChart)}
            >
              Portfolio Chart
            </Typography>
            <Typography className={classes.titleChart}>
              ${numberWithCommas(totalPortfolio.toFixed(2))}
            </Typography>
            <Typography className={classes.subtitleChart}>
              Portfolio Now
            </Typography>
            <AccountSummaryChart email={email} />
          </Container>
          <SpaceDivMainPages />
        </Grid>
      </Container>
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
)(withStyles(styles)(withRouter(AccountSummary)));
