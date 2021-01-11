import React from "react";
import { isEqual, pick } from "lodash";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";

import {
  marketCountdownUpdate,
  oneSecond,
  oneMinute,
} from "../../utils/low-dependency/DayTimeUtil";
import {
  getCachedHistoricalChart,
  getCachedSharesList,
  getFullStockInfo,
} from "../../utils/RedisUtil";
import { getMostActiveStocks } from "../../utils/FinancialModelingPrepUtil";
import { withMediaQuery } from "../../theme/ThemeUtil";

import {
  HideOnScroll,
  getTopShare,
  processExchangeData,
  processCompanyData,
} from "./SubNavbarHelper";

import {
  AppBar,
  Typography,
  Container,
  CircularProgress,
} from "@material-ui/core";

import InfoCard from "./InfoCard";
import themeObj from "../../theme/themeObj";

const styles = (theme) => ({
  subnav: {
    position: "fixed",
    top: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      top: theme.customHeight.appBarHeightSmall,
    },
    zIndex: theme.customZIndex.subNavbar,
    backgroundColor: "#1D212D",
  },
  gridContainer: {
    display: "grid",
    justifyContent: "center",
    alignItems: "center",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    gridTemplateRows: "0.6fr 1fr",
    height: "100%",
  },
  clockContainer: {
    backgroundColor: "#080E33",
    fontSize: "medium",
    color: theme.palette.normalFontColor.primary,
    padding: "2px",
  },
  progress: {
    justifySelf: "center",
    gridArea: "2 / 3 / 3 / 4",
  },
});

const fullHeight = themeObj.customHeight.subBarHeight;
const smallHeight = themeObj.customHeight.subBarHeightSmall;

class SubNavbar extends React.Component {
  state = {
    countdown: "",
    data: [],
  }

  marketCountdownInterval;
  dataInterval;

  updateData = () => {
    let newData = [];
    Promise.all([
      getMostActiveStocks(),
      getCachedSharesList(this.props.userSession.email),
    ])
    .then(([mostActiveStocks, shares]) => {
      const topShare = getTopShare(shares, mostActiveStocks[1]);
      return Promise.all([
        getCachedHistoricalChart("NASDAQ", "5min"),
        getCachedHistoricalChart("NYSE", "5min"),
        getFullStockInfo(topShare),
        mostActiveStocks,
        getFullStockInfo("AAPL"),
      ]);
    })
    .then(([NasdaqHistorical, NyseHistorical, topShareInfo, mostActiveStocks, largestCompanyInfo]) => {
      processExchangeData(newData, "NASDAQ", NasdaqHistorical);
      processExchangeData(newData, "NYSE", NyseHistorical);
      processCompanyData(newData, topShareInfo);
      processCompanyData(newData, {
        symbol: mostActiveStocks[0].ticker,
        price: mostActiveStocks[0].price,
        changesPercentage: parseFloat(mostActiveStocks[0].changesPercentage.slice(1))
      });
      processCompanyData(newData, largestCompanyInfo);

      if(!isEqual(this.state.data, newData))
        this.setState({data: newData});
    })
    .catch((error) => {
        console.log(error);
    });
  };

  componentDidMount() {
    this.marketCountdownInterval = setInterval(
      () => marketCountdownUpdate(this),
      oneSecond
    );

    this.dataInterval = setInterval(
      () => this.updateData(),
      oneMinute * 5
    );
    this.updateData();
  }

  componentDidUpdate() {
    if (this.props.isMarketClosed) {
      this.setState({
        countdown: "",
      });
      clearInterval(this.marketCountdownInterval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.marketCountdownInterval);
    clearInterval(this.dataInterval);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["isMarketClosed", "mediaQuery", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const {
      classes,
      mediaQuery,
      isMarketClosed,
    } = this.props;

    const {
      countdown,
      data,
    } = this.state;

    return (
        <HideOnScroll>
          <AppBar className={classes.subnav} style={{height: mediaQuery ? fullHeight : smallHeight}}>
            <Container
              container
              disableGutters
              className={classes.gridContainer}
              maxWidth={false}
            >
              <Typography
                align={"center"}
                className={classes.clockContainer}
                style={{gridArea: mediaQuery ? "1 / 1 / 2 / 6" : "1 / 1 / 3 / 6"}}
              >
                {isMarketClosed ? "Market Closed" : "Market closed in " + countdown}
              </Typography>

              { mediaQuery && (
                  data.length !== 0 ?
                    data.map((data, index) => { return (
                      <InfoCard
                        name={data[0]}
                        price={data[1]}
                        change={data[2]}
                        index={index}
                        key={`infoCard-${index}`}
                      />
                    )})
                    : <CircularProgress size={24} className={classes.progress}/>
                )
              }
            </Container>
          </AppBar>
        </HideOnScroll>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  isMarketClosed: state.isMarketClosed,
});

export default connect(
  mapStateToProps,
  null
)(withStyles(styles)(withMediaQuery("(min-width:800px)")(SubNavbar)));
