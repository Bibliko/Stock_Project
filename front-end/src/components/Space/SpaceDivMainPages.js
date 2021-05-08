import React from "react";
import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  size: {
    width: "100%",
    height: "60px",
  },
});

class SpaceDivMainPages extends React.Component {
  render() {
    const { classes } = this.props;

    return <div className={classes.size} />;
  }
}

export default withStyles(styles)(withRouter(SpaceDivMainPages));
