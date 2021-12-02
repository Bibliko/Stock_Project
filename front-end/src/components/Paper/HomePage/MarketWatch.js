import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import ExchangeOrCompanyPriceChart from "../../Chart/ExchangeOrCompanyPriceChart";

import { withStyles } from "@material-ui/core/styles";
import { Container, Button } from "@material-ui/core";

const styles = (theme) => ({
  fullHeightWidth: {
    height: "100%",
    padding: 0,
  },
  marketChoices: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  marketButton: {
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  marketButtonChosen: {
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.hover,
    },
  },
});

class MarketWatch extends React.Component {
  state = {
    exchange: "NYSE",
  };

  changeExchange = (newExchange) => {
    const { exchange } = this.state;

    if (exchange !== newExchange) {
      this.setState({
        exchange: newExchange,
      });
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.classes, this.props.classes) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    const { exchange } = this.state;

    return (
      <Container className={classes.fullHeightWidth}>
        <div className={classes.marketChoices}>
          <Button
            className={clsx(classes.marketButton, {
              [classes.marketButtonChosen]: exchange === "NYSE",
            })}
            onClick={() => this.changeExchange("NYSE")}
          >
            NYSE
          </Button>
          <Button
            className={clsx(classes.marketButton, {
              [classes.marketButtonChosen]: exchange === "NASDAQ",
            })}
            onClick={() => this.changeExchange("NASDAQ")}
          >
            NASDAQ
          </Button>
        </div>
        <ExchangeOrCompanyPriceChart exchangeOrCompany={exchange} />
      </Container>
    );
  }
}

export default withStyles(styles)(withRouter(MarketWatch));
