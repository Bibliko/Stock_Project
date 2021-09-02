import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { isEqual } from "lodash";
import { connect } from "react-redux";

import { orderAction } from "../../../redux/storeActions/actions";
import {
  transactionTypeBuy,
  transactionTypeSell,
  transactionOptionGreater,
  transactionOptionLess,
  transactionOptionDefault,
} from "../../../utils/low-dependency/PrismaConstantUtil";
import { isNumeric } from "../../../utils/low-dependency/NumberUtil";
import { getStockScreener } from "../../../utils/FinancialModelingPrepUtil";

import SelectBox from "../../SelectBox/SelectBox";
import VirtualizedAutocomplete from "../../SelectBox/VirtualizedAutocomplete";
import TextField from "../../TextField/SettingTextFields/SettingNormalTextField";

import { Typography } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    flexFlow: "row wrap",
    gap: "0.7rem",
    width: "100%",
  },
  title: {
    flexBasis: "100%",
    fontSize: "x-large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginLeft: "0.6rem",
    marginBottom: "1rem",
    color: theme.palette.secondary.main,
  },
  field: {
    flex: "1 1 45%",
    [theme.breakpoints.down("sx")]: {
      flex: "1 1 100%",
    },
  },
});

const transactionTypes = [
  transactionTypeBuy,
  transactionTypeSell,
];

const transactionOptions = [
  transactionOptionDefault,
  transactionOptionLess,
  transactionOptionGreater,
];

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

class OrderForm extends React.Component {
  state = { options: [] };

  handleDetailChange = (field, value) => {
    if (value && (field === "quantity" || field === "limitPrice")) {
      // value must be an integer
      if (value.indexOf(".") !== -1) return;

      if (value && !isNumeric(value)) return;
      return this.props.mutateOrder({ [field]: parseFloat(value) });
    }
    if (value === transactionOptionDefault)
      return this.props.mutateOrder({ [field]: value, limitPrice: null });

    this.props.mutateOrder({ [field]: value });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.classes, this.props.classes) ||
      !isEqual(nextProps.userOrder, this.props.userOrder) ||
      !isEqual(nextState, this.state)
    );
  }

  componentDidMount() {
    getStockScreener({
      priceFilter: [0, Infinity],
      marketCapFilter: [0, Infinity],
      sectorFilter: "All",
      industryFilter: "All",
    })
      .then((stockData) => {
        this.setState({
          options: stableSort(
            stockData.map((stock) => stock.code),
            (a, b) =>  {
              if (a > b) return 1;
              if (a < b) return -1;
              return 0;
            }
          )
        });
      })
      .catch((err) => console.log(err));
  }

  render() {
    const { options } = this.state;
    const { classes } = this.props;
    const {
      type,
      companyCode,
      quantity,
      option,
      limitPrice,
      amend,
    } = this.props.userOrder;

    return (
      <div className={classes.root}>
        <Typography className={classes.title}>{"Order's details"}</Typography>
        <SelectBox
          style={{flexBasis: "100%"}}
          name={"Type"}
          items={transactionTypes}
          value={type || ""}
          disabled={amend}
          onChange={(event) => this.handleDetailChange(
            "type",
            event.target.value
          )}
        />
        <VirtualizedAutocomplete
          containerClass={classes.field}
          name={"Code"}
          value={companyCode}
          options={options}
          disabled={amend}
          loading={!(companyCode && options)}
          onChange={(event, value) => this.handleDetailChange(
            "companyCode",
            value
          )}
        />
        <TextField
          containerClass={classes.field}
          name={"Quantity"}
          value={quantity || ""}
          onChange={(event) => this.handleDetailChange(
            "quantity",
            event.target.value
          )}
        />
        <SelectBox
          containerClass={classes.field}
          name={"Option"}
          items={transactionOptions}
          value={option || ""}
          disabled={amend}
          onChange={(event) => this.handleDetailChange(
            "option",
            event.target.value
          )}
        />
        <TextField
          containerClass={classes.field}
          name={"Price"}
          value={limitPrice || ""}
          disabled={option === transactionOptionDefault}
          onChange={(event) => this.handleDetailChange(
            "limitPrice",
            event.target.value
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  userOrder: state.userOrder,
});

const mapDispatchToProps = (dispatch) => ({
  mutateOrder: (dataToChange) => dispatch(orderAction("change", dataToChange)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OrderForm));
