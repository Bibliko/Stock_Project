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

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      width: "85%",
      marginTop: theme.customMargin.topLayoutSmall,
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
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "125px",
  },
  noteGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    padding: 0,
    paddingLeft: "24px",
    paddingRight: "24px",
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
  holdingsText: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
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
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.summary)}>
              Summary
            </Typography>
            <SummaryTableContainer
              cash={cash.toFixed(2)}
              totalPortfolio={totalPortfolio.toFixed(2)}
              ranking={ranking}
              userDailyChange={userDailyChange.toFixed(2)}
            />
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.holdings)}>
              Holdings
            </Typography>
            {isEmpty(this.state.holdingsRows) && (
              <Typography className={classes.holdingsText}>
                Start by buying some stocks!
              </Typography>
            )}
            {!isEmpty(this.state.holdingsRows) && (
              <HoldingsTableContainer rows={this.state.holdingsRows} />
            )}
          </Grid>
          <Grid item xs={12} className={classes.noteGrid}>
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
          </Grid>
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
