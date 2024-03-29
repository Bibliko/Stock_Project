import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { isEqual, isEmpty, pick } from "lodash";

import { withTranslation } from "react-i18next";

import { socket } from "../../../App";
import {
  offSocketListeners,
  updatedUserDataFlags,
  checkSocketUpdatedUserDataFlags,
} from "../../../utils/SocketUtil";

import { roundNumber } from "../../../utils/low-dependency/NumberUtil";

import { getCachedSharesList } from "../../../utils/RedisUtil";

import { Grid, Typography, Avatar, Paper } from "@material-ui/core";
import { StorefrontRounded as StorefrontRoundedIcon } from "@material-ui/icons";

import DonutChart from "../../Chart/DonutChart";
import HoldingsTableContainer from "../../Table/AccountSummaryTable/HoldingsTableContainer";

const styles = (theme) => ({
  container: {
    color: "white",
  },
  avatar: {
    width: "60px",
    height: "60px",
    marginLeft: "10px",
    marginRight: "10px",
    [theme.breakpoints.down("xs")]: {
      width: "50px",
      height: "50px",
      marginLeft: "0px",
    },
  },
  gridItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  chartContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "center",
  },
  name: {
    fontSize: "16px",
    fontWeight: "bold",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
  },
  rank: {
    fontSize: "16px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
  },
  dailyChange: {
    fontSize: "18px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
  },
  dailyChangeGreen: {
    color: theme.palette.secondary.main,
  },
  dailyChangeRed: {
    color: theme.palette.fail.main,
  },
  tableTitle: {
    fontSize: "20px",
    paddingBottom: "8px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px",
    },
  },
  paperAccountSummary: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "120px",
    width: "100%",
    color: "white",
    padding: 20,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  storeIcon: {
    height: "30px",
    width: "auto",
    marginBottom: "5px",
    [theme.breakpoints.down("xs")]: {
      height: "20px",
    },
  },
  holdingsText: {
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    textAlign: "center",
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

    this.state.userShares.forEach((share) => {
      holdingsRows.push(
        this.createHoldingData(
          share.id,
          share.companyCode,
          share.quantity,
          share.buyPriceAvg
        )
      );
    });

    if (!isEqual(this.state.holdingsRows, holdingsRows)) {
      this.setState({
        holdingsRows: holdingsRows,
      });
    }
  };

  componentDidMount() {
    getCachedSharesList(this.props.userSession.email)
      .then((shares) => {
        this.setState(
          {
            userShares: shares
              .sort((firstShare, secondShare) => {
                return secondShare.quantity * secondShare.buyPriceAvg - firstShare.quantity * firstShare.buyPriceAvg;  // sorted by value
              })
              .slice(0, 5),
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

  componentWillUnmount() {
    offSocketListeners(socket, updatedUserDataFlags);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["t", "classes", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { t, classes } = this.props;
    const { holdingsRows } = this.state;
    const {
      avatarUrl,
      firstName,
      lastName,
      ranking,
      cash,
      totalPortfolio,
      totalPortfolioLastClosure,
    } = this.props.userSession;
    const dailyChange = roundNumber(totalPortfolio - totalPortfolioLastClosure, 2);

    return (
      <Grid
        container
        item
        direction="row"
        spacing={2}
        xs={12}
        className={classes.container}
      >
        <Grid item xs={12} sm={12} md={6} className={classes.gridItem}>
          <Avatar src={avatarUrl} className={classes.avatar} />
          <div>
            <Typography className={classes.name}>
              {firstName + " " + lastName}
            </Typography>
            <Typography className={classes.rank}>
              {t("ranking.rank") + `: ${ranking}`}
            </Typography>
          </div>
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          className={classes.gridItem}
          style={{
            justifyContent: "center",
          }}
        >
          <Typography
            className={clsx(classes.dailyChange, {
              [classes.dailyChangeGreen]: dailyChange >= 0,
              [classes.dailyChangeRed]: dailyChange < 0,
            })}
          >
            {
              t("account.dailyChange") +
              ` ${dailyChange < 0 ? "- $" : "$"}${Math.abs(dailyChange)}`
            }
          </Typography>
        </Grid>

        <Grid item xs={12} sm={12} md={6} className={classes.chartContainer}>
          <DonutChart
            progress={roundNumber((cash / totalPortfolio) * 100, 2)} // Percentage of cash rounded to 2 decimal places
            scale={5}
            strokeWidth={9}
            totalPortfolio={roundNumber(totalPortfolio, 1)}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={6} className={classes.tableContainer}>
          <Typography className={classes.tableTitle}>
            {t("account.topHoldings")}
          </Typography>
          {isEmpty(holdingsRows) && (
            <Paper className={classes.paperAccountSummary} elevation={2}>
              <StorefrontRoundedIcon className={classes.storeIcon} />
              <Typography className={classes.holdingsText}>
                {t("general.startBuying")}
              </Typography>
            </Paper>
          )}
          {!isEmpty(holdingsRows) && (
            <HoldingsTableContainer minimal={true} rows={holdingsRows} />
          )}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withTranslation()(
    withStyles(styles)(AccountSummary)
  )
);
