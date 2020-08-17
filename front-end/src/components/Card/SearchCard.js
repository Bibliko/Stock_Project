import React from "react";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {
    display: "flex",
  },
});

class SearchCard extends React.Component {
  render() {
    const { classes } = this.props;

    return <div className={classes.root}></div>;
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(
  mapStateToProps,
  null
)(withStyles(styles)(withRouter(SearchCard)));
