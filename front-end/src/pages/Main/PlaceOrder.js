import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { orderAction } from "../../redux/storeActions/actions";

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

class PlaceOrder extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "userSession", "userOrder"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
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
  userOrder: state.userOrder,
});

const mapDispatchToProps = (dispatch) => ({
  mutateOrder: (dataToChange) => dispatch(orderAction("change", dataToChange)),
  clearOrder: () => dispatch(orderAction("clear")),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(PlaceOrder)));
