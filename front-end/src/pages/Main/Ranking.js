import React from "react";
import clsx from "clsx";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";
import {
  getRankingLength,
  getOverallRanking,
  getRegionalRanking,
} from "../../utils/UserUtil";
import { getCachedAccountSummaryChartInfo } from "../../utils/RedisUtil";
import { endOfLastWeek, oneSecond } from "../../utils/low-dependency/DayTimeUtil";

import SelectNoBox from "../../components/SelectBox/SelectNoBox";
import MyStatsTable from "../../components/Table/RankingTable/MyStatsTable";
import OverallTable from "../../components/Table/RankingTable/OverallTable";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";

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
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    maxWidth: "none",
  },
  container: {
    "& > div + div": {
      marginTop: "60px",
      [theme.breakpoints.down("xs")]: {
        marginTop: "40px",
      },
    },
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  itemGridWrapper: {
    width: "100%",
    maxWidth: "1000px",
  },
  titleFont: {
    fontSize: "x-large",
    color: theme.palette.primary.main,
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    textAlign: "left",
  },
  titleContainer: {
    marginBottom: "20px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "10px",
    },
  },
  textField: {
    width: "100%",
    margin: "8px",
    fontWeight: "normal",
    "& label": {
      color: theme.palette.normalFontColor.secondary,
      "&.Mui-focused": {
        color: theme.palette.secondary.main,
      },
    },
    "& .MuiFilledInput-underline:after": {
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
    "& .MuiFilledInput-root": {
      "&.Mui-focused": {
        backgroundColor: theme.palette.paperBackground.onPageSuperLight,
      },
    },
  },
  selectIcon: {
    color: theme.palette.normalFontColor.secondary,
  },
  select: {
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    "&:hover": {
      backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    },
    "& input": {
      backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    },
  },
  menuItem: {
    "&:hover": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
    "&.MuiListItem-root": {
      "&.Mui-selected": {
        backgroundColor: theme.palette.menuItemHover.main,
      },
    },
  },
});

const regions = [
  "Africa",
  "Asia",
  "The Caribbean",
  "Central America",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

const options = [
  {
    value: "Overall",
    label: "Overall Ranking",
  },
  ...regions.map((region) => ({
    value: region,
    label: region + " Ranking",
  })),
];

class Ranking extends React.Component {
  constructor(props) {
    super(props);
    const { portfolioValue } = this.props;

    this.state = {
      rankingOption: "Overall",
      rankingUsersData: {},
      totalUser: {},
      rankingPage: 0,
      lastWeekPortfolio: portfolioValue,
      portfolioHigh: portfolioValue,
      portfolioLow: portfolioValue,
    };
  }

  timeoutToChangePage;

  changeRankingOption = (event) => {
    if (!isEqual(this.state.rankingOption, event.target.value)) {
      this.setState({
        rankingOption: event.target.value,
        rankingPage: 0,
      });
    }
  };

  getRankingData = () => {
    const {
      rankingUsersData,
      rankingOption,
      rankingPage,
    } = this.state;

    if (rankingOption === "Overall") {
      // difference in index
      return getOverallRanking(rankingPage + 1)
        .then((overallUsers) => {
          this.setState({
            rankingUsersData: {
              ...rankingUsersData,
              Overall: overallUsers,
            }
          });
        })
        .catch((error) => console.log(error));
    }

    // Get regional ranking
    getRegionalRanking(rankingPage + 1, rankingOption)
      .then((regionalUsers) => {
        this.setState({
          rankingUsersData: {
            ...rankingUsersData,
            [rankingOption]: regionalUsers,
          }
        });
      })
      .catch((error) => console.log(error));
  };

  changeRankingPage = (event, newPage) => {
    if (this.timeoutToChangePage) {
      clearTimeout(this.timeoutToChangePage);
    }

    this.setState({ rankingPage: newPage }, () => {
      this.timeoutToChangePage = setTimeout(
        () => this.getRankingData(newPage),
        oneSecond / 10
      );
    });
  };

  componentDidMount () {
    const { email, portfolioValue } = this.props.userSession;

    // (k, Promise a) -> Promise (k, a)
    const addRegion = ([region, regionPromise]) => (
      regionPromise.then((data) => [region, data])
    );

    // Fetch ranking length
    Promise.all([
      getRankingLength(),
      ...regions
        .map((region) => [region, getRankingLength(region)])
        .map(addRegion)
    ])
      .then(([overallLength, ...regionalLength]) => {
        this.setState({
          totalUser: {
            Overall: overallLength,
            ...Object.fromEntries(regionalLength),
          }
        });
      })
      .catch((error) => console.log(error));

    // Fetch other data
    Promise.all([
      getOverallRanking(1),
      getCachedAccountSummaryChartInfo(email),
      ...regions
        .map((region) => [region, getRegionalRanking(1, region)])
        .map(addRegion)
    ])
      .then(([overallUsers, cachedTimestamp, ...regionalUsers]) => {
        const rankingUsersData = {
          Overall: overallUsers,
          ...Object.fromEntries(regionalUsers),
        };
        const lastWeek = endOfLastWeek();
        const { data } = cachedTimestamp;
        let lastWeekPortfolio = 0;
        let portfolioHigh = parseFloat(data[0][1]);
        let portfolioLow = parseFloat(data[0][1]);

        if (data) {
          for (let id = data.length - 1; id >= 0; --id) {
            const timestamp = data[id];
            const value = parseFloat(timestamp[1]);

            // eliminate cases that value of timestamp is null
            if (timestamp[0] && (new Date(timestamp[0])) <= lastWeek && !lastWeekPortfolio) {
              lastWeekPortfolio = value;
            }
            portfolioHigh = value > portfolioHigh ? value : portfolioHigh;
            portfolioLow = value < portfolioLow ? value : portfolioLow;
          }
        }
        lastWeekPortfolio = lastWeekPortfolio || portfolioValue; // default to portfolioValue

        this.setState({
          rankingUsersData,
          lastWeekPortfolio,
          portfolioHigh,
          portfolioLow,
        });
      })
      .catch((error) => console.log(error));
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
      ranking,
      regionalRanking,
      totalPortfolio,
    } = this.props.userSession;
    const {
      rankingOption,
      rankingUsersData,
      totalUser,
      rankingPage,
      lastWeekPortfolio,
      portfolioHigh,
      portfolioLow,
    } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.container)}
        >
          <Grid item xs={12} className={classes.itemGrid} align="center">
            <div className={classes.itemGridWrapper}>
              <SelectNoBox
                containerStyle={classes.titleContainer}
                fontStyle={classes.titleFont}
                items={options}
                value={rankingOption}
                onChange={this.changeRankingOption}
              />
              <OverallTable
                style={{marginTop: "10px"}}
                users={rankingUsersData[rankingOption]}
                totalUser={totalUser[rankingOption] || 0}
                currentPage={rankingPage}
                handleChangePage={this.changeRankingPage}
              />
            </div>
          </Grid>

          <Grid item xs={12} className={classes.itemGrid} align="center">
            <div className={classes.itemGridWrapper}>
              <MyStatsTable
                overallRank={ranking}
                regionRank={regionalRanking}
                portfolioValue={totalPortfolio}
                changeFromPreviousWeek={totalPortfolio - lastWeekPortfolio}
                portfolioHigh={portfolioHigh}
                portfolioLow={portfolioLow}
              />
            </div>
          </Grid>

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
)(withStyles(styles)(withRouter(Ranking)));
