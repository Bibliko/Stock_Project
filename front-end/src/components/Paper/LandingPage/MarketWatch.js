import React from "react";
import { withRouter } from "react-router";

import NYSEMarketWatch from "../../Chart/MarketWatch/NYSE";

import { withStyles } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";

const styles = (theme) => ({
  fullHeightWidth: {
    height: "100%",
    padding: 0,
  },
});

class MarketWatch extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.fullHeightWidth}>
        <NYSEMarketWatch />
      </Container>
    );
  }
}

export default withStyles(styles)(withRouter(MarketWatch));
