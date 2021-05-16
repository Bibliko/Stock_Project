import React from "react";
import PropTypes from "prop-types";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { getStockNews } from "../../../utils/FinancialModelingPrepUtil";
import { oneMinute } from "../../../utils/low-dependency/DayTimeUtil";

import CompanyNewsCard from "./CompanyNewsCard";

import { withStyles } from "@material-ui/core/styles";
import { Typography, Grid, Divider } from "@material-ui/core";

const styles = (theme) => ({
  title: {
    fontSize: "xx-large",
    fontWeight: "bold",
    color: "white",
  },
  title2: {
    fontSize: "x-large",
    fontWeight: "bold",
    color: "white",
  },
  companyGrid: {
    alignSelf: "center",
    width: "100%",
    marginBottom: theme.customMargin.companyDetailPageSectionMarginBottom,
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: "5px",
    marginBottom: "30px",
  },
  title3: {
    fontSize: "small",
    fontWeight: "bold",
    color: "white",
  },
});

class CompanyNewsContainer extends React.Component {
  state = {
    news: [
      {
        symbol: "GOOGL",
        publishedDate: "2020-11-12 15:04:53",
        title: "6 Streaming Stocks to Keep Your Eye On",
        image: "https://cdn.snapi.dev/images/v1/d/m/fe212-2.jpg",
        site: "InvestorPlace",
        text:
          "Broadcasters and cable giants must bow before the streaming powerhouses in today's world -- making these streaming stocks very valuable. The post 6 Streaming Stocks to Keep Your Eye On appeared first on InvestorPlace.",
        url:
          "https://investorplace.com/2020/11/6-streaming-stocks-to-keep-your-eye-on/",
      },
    ],
  };

  intervalCheckNews;

  checkAndSetStateNews = () => {
    // getStockNews(this.props.companyData.symbol, 10)
    //   .then((newsArray) => {
    //     if (!isEqual(newsArray, this.state.news)) {
    //       this.setState({
    //         news: newsArray,
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  componentDidMount() {
    // this.checkAndSetStateNews();
    // this.intervalCheckNews = setInterval(this.checkAndSetStateNews, oneMinute)
  }

  componentWillUnmount() {
    clearInterval(this.intervalCheckNews);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "companyData"];
    const compareProps = pick(this.props, compareKeys);
    const compareNextProps = pick(nextProps, compareKeys);

    return (
      !isEqual(compareNextProps, compareProps) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;
    const { news } = this.state;

    return (
      <Grid
        container
        spacing={2}
        direction="column"
        className={classes.companyGrid}
        item
        xs={12}
      >
        <Typography className={classes.title2}>News</Typography>
        <Divider className={classes.divider} />
        <Grid
          item
          xs={12}
          container
          direction="column"
          spacing={2}
          style={{ alignSelf: "center" }}
        >
          {news.map((companyNews, index) => (
            <CompanyNewsCard key={index} newsObject={companyNews} />
          ))}
        </Grid>
      </Grid>
    );
  }
}

CompanyNewsContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  companyData: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(CompanyNewsContainer));
