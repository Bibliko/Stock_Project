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
  Slide,
  IconButton,
  Typography,
  Container,
  CircularProgress,
} from "@material-ui/core";

import { ExpandMore, ExpandLess } from "@material-ui/icons";

import InfoCard from "./InfoCard";
import themeObj from "../../theme/themeObj";

const styles = (theme) => ({
  subnav: {
    height: themeObj.customHeight.subBarHeight,
    position: "fixed",
    top: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      top: theme.customHeight.appBarHeightSmall,
    },
    zIndex: theme.customZIndex.subNavbar,
    backgroundColor: "transparent",
  },
  gridContainer: {
    display: "grid",
    justifyContent: "center",
    alignItems: "center",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    gridTemplateRows: "0.5fr 1fr",
  },
  clockContainer: {
    height: "100%",
    zIndex: theme.customZIndex.subNavbar,
    backgroundColor: theme.palette.paperBackground.sub,
    fontSize: "medium",
    fontWeight: "bold",
    color: theme.palette.normalFontColor.primary,
    padding: "2px",
  },
  progressContainer: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gridArea: "2 / 1 / 3 / 6",
    backgroundColor: "#1D212D",
    paddingTop: "14px",
    paddingBottom: "14px",
  },
  collapseButton: {
    color: "white",
    position: "absolute",
    right: "5px",
    padding: "0px",
  },
});

class SubNavbar extends React.Component {
  state = {
    countdown: "",
    data: [],
    collapse: false,
  };

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
      .then(
        ([
          NasdaqHistorical,
          NyseHistorical,
          topShareInfo,
          mostActiveStocks,
          largestCompanyInfo,
        ]) => {
          processExchangeData(newData, "NASDAQ", NasdaqHistorical);
          processExchangeData(newData, "NYSE", NyseHistorical);
          processCompanyData(newData, topShareInfo);
          processCompanyData(newData, {
            symbol: mostActiveStocks[0].ticker,
            price: mostActiveStocks[0].price,
            changesPercentage: parseFloat(
              mostActiveStocks[0].changesPercentage.slice(1)
            ),
          });
          processCompanyData(newData, largestCompanyInfo);

          if (!isEqual(this.state.data, newData))
            this.setState({ data: newData });
        }
      )
      .catch((error) => {
        console.log(error);
      });
  };

  toggle = () => {
    const { collapse } = this.state;
    this.setState({ collapse: !collapse });
  };

  componentDidMount() {
    this.marketCountdownInterval = setInterval(
      () => marketCountdownUpdate(this),
      oneSecond
    );

    this.dataInterval = setInterval(() => this.updateData(), oneMinute * 5);
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
    const compareKeys = ["classes", "isMarketClosed", "mediaQuery", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, mediaQuery, isMarketClosed } = this.props;

    const { collapse, countdown, data } = this.state;

    const showCards = mediaQuery && !collapse;

    return (
      <HideOnScroll>
        <AppBar
          className={classes.subnav}
          style={{ boxShadow: showCards || "none" }}
        >
          <Container
            disableGutters
            className={classes.gridContainer}
            maxWidth={false}
          >
            <Typography
              align={"center"}
              className={classes.clockContainer}
              style={{
                gridArea: mediaQuery ? "1 / 1 / 2 / 6" : "1 / 1 / 3 / 6",
                cursor: mediaQuery && "pointer",
              }}
              onClick={mediaQuery ? this.toggle : () => {}}
            >
              {isMarketClosed
                ? "Market Closed"
                : "Market closed in " + countdown}

              {mediaQuery && (
                <IconButton
                  className={classes.collapseButton}
                  component="span"
                  aria-label="collapse"
                  onClick={this.toggle}
                >
                  {collapse ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
              )}
            </Typography>

            {data.length ? (
              data.map((data, index) => {
                return (
                  <InfoCard
                    name={data[0]}
                    price={data[1]}
                    change={data[2]}
                    index={index}
                    key={`infoCard-${index}`}
                    show={showCards}
                  />
                );
              })
            ) : (mediaQuery &&
              <Slide appear={false} direction="down" in={showCards}>
                <div className={classes.progressContainer}>
                  <CircularProgress size={24} />
                </div>
              </Slide>
            )}
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
