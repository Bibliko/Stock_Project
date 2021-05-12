import React from "react";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";

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
});

class ComponentName extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.userSession, this.props.userSession) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        {/* content */}
        <SpaceDivMainPages />
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(ComponentName))
);
