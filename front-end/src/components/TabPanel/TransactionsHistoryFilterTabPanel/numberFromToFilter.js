import React from "react";
import { isEqual, isEmpty, pick } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";

import { withStyles } from "@material-ui/core/styles";
import { Button, TextField } from "@material-ui/core";

const styles = (theme) => ({
  disableButton: {
    color: "white",
    cursor: "unset",
    "&.MuiButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0)",
    },
  },
  mainTextField: {
    width: "45%",
    marginBottom: theme.customMargin.dialogItemsTransactionsHistoryFilters,
  },
  inputBase: {
    color: "white",
    borderRadius: "4px",
    paddingLeft: "10px",
    paddingRight: "10px",
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    "&:focus": {
      backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    },
  },
  iconButton: {
    color: "rgba(255, 255, 255, 0.7)",
    "&.MuiIconButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0)",
    },
  },
  form: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
});

/**
  Props:
  key={key}
  reportError={this.reportError}
  clearFlag={clearTemporaryValuesFlag}
  filterName={key}
  filters={filters}
  handleChangeFilters={handleChangeFilters}
 */
class NumberFromToFilter extends React.Component {
  state = {
    from: "",
    to: "",
    errorText: "",
  };

  keys = {
    Quantity: "quantity",
    Price: "price",
    "Gain/Loss": "spendOrGain",
  };

  timeoutUpdateFrom;
  timeoutUpdateTo;

  getFromOrTo = (fromOrTo) => {
    const rightKey = this.keys[this.props.filterName];
    const filtersFromTo = this.props.filters[rightKey].split("_to_");
    return fromOrTo === "from" ? filtersFromTo[0] : filtersFromTo[1];
  };

  checkErrorFromTo = (from, to) => {
    if (from !== "none" && to !== "none") {
      if (parseFloat(from) > parseFloat(to)) {
        return "From must < To.";
      }
    }
    return "";
  };

  setTimeoutChangeFromToFilters = (newFilters) => {
    return setTimeout(
      () => this.props.handleChangeFilters(newFilters),
      oneSecond / 3
    );
  };

  handleChangeValue = (fromOrTo) => (event) => {
    const { from, to, errorText } = this.state;
    const value = event.target.value === "" ? "none" : event.target.value;

    const rightKey = this.keys[this.props.filterName];

    // create and add new value to newFilters object
    const newFilters = { ...this.props.filters };
    newFilters[rightKey] =
      fromOrTo === "from" ? `${value}_to_${to}` : `${from}_to_${value}`;

    if (this.timeoutUpdateFrom) {
      clearTimeout(this.timeoutUpdateFrom);
    }

    if (this.timeoutUpdateTo) {
      clearTimeout(this.timeoutUpdateTo);
    }

    const newState = {};
    if (fromOrTo === "from") {
      newState.from = value;
    } else {
      newState.to = value;
    }

    this.setState(newState, () => {
      // check error: From < To
      const error =
        fromOrTo === "from"
          ? this.checkErrorFromTo(value, to)
          : this.checkErrorFromTo(from, value);

      if (isEmpty(error)) {
        if (!isEmpty(errorText)) {
          this.props.reportError(false);
        }
        this.setState({ errorText: "" });

        if (fromOrTo === "from") {
          this.timeoutUpdateFrom = this.setTimeoutChangeFromToFilters(
            newFilters
          );
        } else {
          this.timeoutUpdateTo = this.setTimeoutChangeFromToFilters(newFilters);
        }
      } else {
        if (isEmpty(errorText)) {
          this.props.reportError(true);
        }
        this.setState({ errorText: error });
      }
    });
  };

  componentDidMount() {
    this.setState({
      from: this.getFromOrTo("from"),
      to: this.getFromOrTo("to"),
    });
  }

  componentDidUpdate(prevProps) {
    const fromFilters = this.getFromOrTo("from");
    const toFilters = this.getFromOrTo("to");

    if (prevProps.clearFlag !== this.props.clearFlag) {
      this.setState({
        from: fromFilters,
        to: toFilters,
        errorText: "",
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "filters", "filterName", "clearFlag"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, filterName } = this.props;
    const { from, to, errorText } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          {filterName}
        </Button>
        <div className={classes.form}>
          <TextField
            error={!isEmpty(errorText)}
            helperText={!isEmpty(errorText) ? errorText : ""}
            placeholder="From"
            onChange={this.handleChangeValue("from")}
            value={from === "none" ? "" : from}
            type="number"
            className={classes.mainTextField}
            InputProps={{
              className: classes.inputBase,
            }}
          />
          <TextField
            error={!isEmpty(errorText)}
            placeholder="To"
            onChange={this.handleChangeValue("to")}
            value={to === "none" ? "" : to}
            type="number"
            className={classes.mainTextField}
            InputProps={{
              className: classes.inputBase,
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(NumberFromToFilter));
