import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { isEqual, pick } from "lodash";
import { connect } from "react-redux";
import { orderAction } from "../../../redux/storeActions/actions";

import { withTranslation } from "react-i18next";

import { getFullStockInfo } from "../../../utils/RedisUtil";
import { placeOrder, amendOrder } from "../../../utils/TransactionUtil";
import { roundNumber } from "../../../utils/low-dependency/NumberUtil";
import { transactionOptionDefault } from "../../../utils/low-dependency/PrismaConstantUtil";
import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";

import ProgressButton from "../../Button/ProgressButton";

import {
  Button,
  Paper,
  Typography,
  Snackbar,
} from "@material-ui/core";

import { Alert } from "@material-ui/lab";

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    flexFlow: "row wrap",
    gap: "0.7rem",
    width: "100%",
    padding: '0px 10px',
    maxWidth: "400px",
    [theme.breakpoints.down("sm")]: {
      paddingTop: "20px",
    },
  },
  paper: {
    display: "flex",
    flexFlow: "row wrap",
    flexBasis: "100%",
    backgroundColor: theme.palette.paperBackground.onPage,
    color: theme.palette.normalFontColor.primary,
    borderRadius: "4px",
    width: "100%",
    padding: "1.2rem 1.5rem 2rem 1.5rem",
  },
  title: {
    flexBasis: "100%",
    fontSize: "x-large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1rem",
    color: theme.palette.primary.main,
  },
  label: {
    flexBasis: "50%",
    minWidth: "7.15em",
    marginTop: "0.6rem",
    fontWeight: "bold",
    fontSize: "1.25em",
    letterSpacing: "0.04em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.15em",
      letterSpacing: "initial"
    },
  },
  content: {
    marginTop: "0.6rem",
    fontSize: "1.25em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.15em",
    },
  },
  buttonContainer: {
    flexGrow: "1",
    width: "unset",
    color: theme.palette.normalFontColor.primary,
    flexBasis: "40%",
  },
  clearButton: {
    background: theme.palette.primary.transparent,
    "&:hover": {
      background: theme.palette.primary.transparentHover,
    },
  },
});

class OrderSummary extends React.Component {
  state = {
    brokerage: "",
    fail: false,
    success: false,
    loading: false,
    openSnackbar: false,
    alertSeverity: "success",
  };

  // prevent double click
  submitTimeout;

  calculateBrokerage = (lastPrice, quatity) => {
    let brokerage;
    /**
     * Brokerage ( phí giao dịch )
     * Case 1 : tổng giá trị giao dịch ( sell/buy ) bé hơn bằng 10000 $ thì brokerage = 20 $
     * Case 2 : tổng giá trị trị giao dịch lớn hơn 10 000$ thì brokerage = 20$ + 0.25% ( tổng giá trị giao dịch - 10000 $ )
     * ví dụ : buy/sell lượng cổ phiếu giá 15 000 thì brokerage = 20 + 0.25% * 5000
     */

    if (lastPrice * quatity <= 10000) {
      brokerage = 20;
    } else {
      brokerage = 20 + (0.25 / 100) * (lastPrice * quatity - 10000);
    }

    return roundNumber(brokerage, 2);
  };

  updateBrokerage = () => {
    const { companyCode, quantity, limitPrice } = this.props.userOrder;

    if (limitPrice)
      return this.setState({ brokerage: this.calculateBrokerage(limitPrice, quantity) });

    getFullStockInfo(companyCode)
      .then((stockInfo) => {
        this.setState({ brokerage: this.calculateBrokerage(stockInfo.price, quantity) });
      })
      .catch((err) => console.log(err));
  };

  validateOrder = () => {
    const {
      type,
      companyCode,
      quantity,
      option,
      limitPrice,
    } = this.props.userOrder;

    return (
      type && companyCode && quantity && option &&
      // if option is not default, there must be a limitPrice
      (option === transactionOptionDefault || limitPrice)
    );
  };

  handleSubmit = () => {
    if (!this.validateOrder())
      return this.setState({ fail: true });

    const { id: userID } = this.props.userSession;
    const {
      id: orderID,
      type,
      companyCode,
      quantity,
      option,
      limitPrice,
      amend,
    } = this.props.userOrder;
    const { clearOrder, handleResetAutocomplete } = this.props;
    const { brokerage } = this.state;
    const orderData = {
      type,
      companyCode,
      quantity,
      option,
      limitPrice: option === transactionOptionDefault ? null : limitPrice,
      brokerage,
    };
    const id = amend ? orderID : userID;
    const submitOrder = amend ? amendOrder : placeOrder;

    this.setState({
      loading: true,
      success: false,
      fail: false,
    }, () => {
      submitOrder(id, orderData)
        .then(() => {
          this.setState({
            loading: false,
            success: true,
          });
          clearOrder();
          handleResetAutocomplete();
          this.handleOpenSnackbar("success");
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            fail: true,
          });
          this.handleOpenSnackbar("error");
        });
    });
  };

  handleSubmitClick = () => {
    if (this.submitTimeout) {
      clearTimeout(this.submitTimeout);
    }
    this.submitTimeout = setTimeout(
      () => this.handleSubmit(),
      oneSecond * 0.5
    );
  };

  handleOpenSnackbar = (severity) => {
    this.setState({
      openSnackbar: true,
      alertSeverity: severity,
    });
  };

  handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({
      openSnackbar: false,
    });
  };

  componentDidMount() {
    if (this.validateOrder())
      this.updateBrokerage();
    else
      this.setState({ brokerage: "" });
  }

  componentDidUpdate() {
    if (this.validateOrder())
      this.updateBrokerage();
    else
      this.setState({ brokerage: "" });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["t", "classes", "userOrder"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const {
      t,
      classes,
      clearOrder,
      handleResetAutocomplete,
    } = this.props;
    const {
      brokerage,
      fail,
      success,
      loading,
      openSnackbar,
      alertSeverity,
    } = this.state;
    const {
      type,
      companyCode,
      quantity,
    } = this.props.userOrder;

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography className={classes.title}>
            {t("placeOrder.summary")}
          </Typography>

          <Typography className={classes.label}>
            {t("general.type") + ":"}
          </Typography>
          <Typography className={classes.content}>
            {type ? t("general." + type) : ""}
          </Typography>

          <Typography className={classes.label}>
            {t("general.code") + ":"}
          </Typography>
          <Typography className={classes.content}>{companyCode}</Typography>

          <Typography className={classes.label}>
            {t("general.quantity") + ":"}
          </Typography>
          <Typography className={classes.content}>{quantity}</Typography>

          <Typography className={classes.label}>
            {t("general.brokerage") + ":"}
          </Typography>
          <Typography className={classes.content}>{brokerage && `$${brokerage}`}</Typography>
        </Paper>

        <Button
          aria-label="Clear"
          variant="outlined"
          disableElevation
          color="primary"
          className={clsx(classes.buttonContainer, classes.clearButton)}
          onClick={() => {
            clearOrder();
            handleResetAutocomplete();
          }}
        >
          {t("general.clear")}
        </Button>

        <ProgressButton
          containerClass={classes.buttonContainer}
          success={success}
          fail={fail}
          loading={loading}
          handleClick={this.handleSubmitClick}
        >
          {t("general.submit")}
        </ProgressButton>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={5 * oneSecond}
          onClose={this.handleCloseSnackbar}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={this.handleCloseSnackbar}
            severity={alertSeverity}
          >
            {
              `${alertSeverity === "success"
              ? t("placeOrder.successfulAlert")
              : t("placeOrder.failedAlert")} ${t("placeOrder.yourOrder")}`
            }
          </Alert>
        </Snackbar>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  userOrder: state.userOrder,
});

const mapDispatchToProps = (dispatch) => ({
  clearOrder: () => dispatch(orderAction("clear")),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withTranslation()(
    withStyles(styles)(OrderSummary)
  )
);
