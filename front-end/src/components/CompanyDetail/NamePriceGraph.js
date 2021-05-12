import React from "react";
import PropTypes from "prop-types";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import ExchangeOrCompanyPriceChart from "../Chart/ExchangeOrCompanyPriceChart";

import { withStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";

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

  spaceBottom: {
    marginBottom: "30px",
  },

  companyGrid: {
    alignSelf: "center",
    width: "100%",
    marginBottom: theme.customMargin.companyDetailPageSectionMarginBottom,
  },
});

class NamePriceGraph extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "companyName", "companyCode", "recentPrice"];
    const compareProps = pick(this.props, compareKeys);
    const compareNextProps = pick(nextProps, compareKeys);

    return !isEqual(compareNextProps, compareProps);
  }

  render() {
    const { classes, graphOnly, companyName, companyCode, recentPrice } = this.props;

    return (
      <Grid
        item
        xs={12}
        container
        direction="row"
        className={classes.companyGrid}
      >
        {!graphOnly &&
          <React.Fragment>
            <Grid item xs={12}>
              <Typography className={classes.title}>
                {`${companyName} (${companyCode.toUpperCase()})`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography className={classes.title2}>
                {`$${recentPrice.toFixed(2)}`}
              </Typography>
            </Grid>
          </React.Fragment>
        }
        <Grid item xs={12}>
          <ExchangeOrCompanyPriceChart
            exchangeOrCompany={companyCode.toUpperCase()}
          />
        </Grid>
      </Grid>
    );
  }
}

NamePriceGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  companyName: PropTypes.string.isRequired,
  companyCode: PropTypes.string.isRequired,
  recentPrice: PropTypes.number.isRequired,
};

export default withStyles(styles)(withRouter(NamePriceGraph));
