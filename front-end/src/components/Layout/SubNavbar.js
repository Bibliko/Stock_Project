import React from "react";
import { isEqual, pick } from "lodash";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";

import {
  marketCountdownUpdate,
  oneSecond,
  oneMinute,
} from "../../utils/low-dependency/DayTimeUtil";
import {
  getCachedHistoricalChart,
  getParsedCachedSharesList,
  getFullStockInfo,
} from "../../utils/RedisUtil";
import { getMostActiveStocks } from "../../utils/FinancialModelingPrepUtil";
import { roundNumber } from "../../utils/low-dependency/NumberUtil";

import {
  AppBar,
  Typography,
  Container,
  Slide,
  CircularProgress,
  useMediaQuery,
  useScrollTrigger,
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

const withMediaQuery = (...args) => Component => props => {
  const mediaQuery = useMediaQuery(...args);
  return <Component mediaQuery={mediaQuery} {...props} />;
};

function HideOnScroll(props) {
  const {
    children,
  } = props;
  const trigger = useScrollTrigger({threshold: 10});
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

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
      getParsedCachedSharesList(this.props.userSession.email),
    ])
    .then(([mostActiveStocks, shares]) => {
      const topShare = shares.length !== 0 ? shares.sort((firstShare, secondShare) => {
        return secondShare.quantity * secondShare.buyPriceAvg - firstShare.quantity * firstShare.buyPriceAvg;  // sorted by value
      })[0].companyCode : mostActiveStocks[1].ticker;  // default to second most active stock

      Promise.all([
        getCachedHistoricalChart("NASDAQ", "5min"),
        getCachedHistoricalChart("NYSE", "5min"),
        getFullStockInfo(topShare),
        getFullStockInfo("AAPL"),
      ])
      .then(([NasdaqHistorical, NyseHistorical, topShareInfo, largestCompanyInfo]) => {
        const processExchangeData = (exchange, exchangeHistorical) => {
          const currentDay = exchangeHistorical[0].date.slice(8, 10);  // extract current day
          const currentValue = exchangeHistorical[0].close;
          const lastValue = exchangeHistorical.find((data) => data.date.slice(8, 10) !== currentDay).close;
          newData.push([
            exchange,
            roundNumber(currentValue, 2),
            roundNumber((currentValue - lastValue) / lastValue * 100, 1)
          ]);
        };
        const processCompanyData = (companyInfo) => {
          newData.push([
            companyInfo.symbol,
            roundNumber(companyInfo.price, 2),
            roundNumber(companyInfo.changesPercentage, 1)
          ]);
        };

        processExchangeData("NASDAQ", NasdaqHistorical);
        processExchangeData("NYSE", NyseHistorical);
        processCompanyData(topShareInfo);
        processCompanyData({
          symbol: mostActiveStocks[0].ticker,
          price: mostActiveStocks[0].price,
          changesPercentage: parseFloat(mostActiveStocks[0].changesPercentage.slice(1))
        });
        processCompanyData(largestCompanyInfo);

        this.setState({data: newData});
      })
      .catch((error) => {
        console.log(error);
      });
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
    const compareKeys = ["isMarketClosed", "mediaQuery"];
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
