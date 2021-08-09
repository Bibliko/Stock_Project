import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { orderAction } from "../../redux/storeActions/actions";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";
import OrderSummary from "../../components/Paper/PlaceOrderPage/OrderSummary";
import OrderForm from "../../components/Paper/PlaceOrderPage/OrderForm";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";

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
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    minHeight: "200px",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "125px",
  },
});

class PlaceOrder extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "userOrder"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  componentWillUnmount() {
    this.props.clearOrder();
  }

  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={5}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid
            item
            xs={12}
            md={8}
            className={classes.itemGrid}
          >
            <OrderForm />
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            className={classes.itemGrid}
          >
            <OrderSummary />
          </Grid>
        </Grid>
        <SpaceDivMainPages />
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userOrder: state.userOrder,
});

const mapDispatchToProps = (dispatch) => ({
  clearOrder: () => dispatch(orderAction("clear")),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(PlaceOrder)));
