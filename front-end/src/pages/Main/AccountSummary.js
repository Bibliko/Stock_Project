import React from "react";
import { isEqual, isEmpty, pick } from "lodash";
import { withRouter } from "react-router";

import { socket } from "../../App";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import {
  offSocketListeners,
  updatedUserDataFlags,
  checkSocketUpdatedUserDataFlags,
} from "../../utils/SocketUtil";

import { getUserData } from "../../utils/UserUtil";

import { getCachedSharesList } from "../../utils/RedisUtil";
import {
  numberWithCommas,
  roundNumber,
} from "../../utils/low-dependency/NumberUtil";

import HoldingsTableContainer from "../../components/Table/AccountSummaryTable/HoldingsTableContainer";
import SummaryTableContainer from "../../components/Table/AccountSummaryTable/SummaryTableContainer";
import AccountSummaryChart from "../../components/Chart/AccountSummaryChart";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid, Typography, Paper } from "@material-ui/core";

import { StorefrontRounded as StorefrontRoundedIcon } from "@material-ui/icons";

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
    marginBottom: "5px",
    color: theme.palette.primary.main,
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
    updatedAllUsersFlag: false,
    updatedRankingListFlag: false,
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
    getCachedSharesList(this.props.userSession.email)
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

    checkSocketUpdatedUserDataFlags(socket, this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { email } = this.props.userSession;

    const compareKeys = ["updatedRankingListFlag", "updatedAllUsersFlag"];
    const stateForCompare = pick(this.state, compareKeys);
    const prevStateForCompare = pick(prevState, compareKeys);

    const dataNeeded = {
      cash: true,
      totalPortfolio: true,
      totalPortfolioLastClosure: true,
      ranking: true,
      email: true,
    };

    if (!isEqual(stateForCompare, prevStateForCompare)) {
      getUserData(dataNeeded, email)
        .then((userData) => {
          this.props.mutateUser(userData);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  componentWillUnmount() {
    offSocketListeners(socket, updatedUserDataFlags);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
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
      hasFinishedSettingUp,
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
            <Typography className={classes.gridTitle}>Summary</Typography>
            <SummaryTableContainer
              cash={roundNumber(cash, 2)}
              totalPortfolio={roundNumber(totalPortfolio, 2)}
              ranking={ranking}
              userDailyChange={roundNumber(userDailyChange, 2)}
            />
          </Container>
          <Container className={classes.itemContainer}>
            <Typography className={classes.gridTitle}>Holdings</Typography>
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
            <Typography className={classes.gridTitle}>
              Portfolio Chart
            </Typography>
            <Typography className={classes.titleChart}>
              ${numberWithCommas(roundNumber(totalPortfolio, 2))}
            </Typography>
            <Typography className={classes.subtitleChart}>
              Portfolio Now
            </Typography>
            <AccountSummaryChart
              email={email}
              hasFinishedSettingUp={hasFinishedSettingUp}
            />
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
