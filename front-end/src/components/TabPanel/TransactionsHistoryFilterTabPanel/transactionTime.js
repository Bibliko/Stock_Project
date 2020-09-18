import React from "react";
import clsx from "clsx";
import { isEqual, isEmpty, pick } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import {
  checkDateValidError,
  compareTwoDates,
} from "../../../utils/low-dependency/DayTimeUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@material-ui/core";

import { ClearRounded as ClearRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  disableButton: {
    color: "white",
    cursor: "unset",
    "&.MuiButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0)",
    },
  },
  mainTextField: {
    width: "100%",
    marginBottom: theme.customMargin.dialogItemsTransactionsHistoryFilters,
  },
  inputBase: {
    color: "white",
    borderRadius: "4px",
    paddingLeft: "10px",
    paddingRight: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&:focus": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
  },
  hide: {
    display: "none",
  },
});

/**
  Props:
  reportError={this.reportError}
  clearFlag={clearTemporaryValuesFlag}
  filters={filters}
  handleChangeFilters={handleChangeFilters}
 */
class TransactionTimeFilter extends React.Component {
  state = {
    from: "",
    to: "",
    errorText: "",
  };

  timeoutUpdateFrom;
  timeoutUpdateTo;

  clearFilterFrom = () => {
    const { from, to } = this.state;
    const error = this.getError("to", from, to);
    this.setState({ from: "none", errorText: error });

    if (isEmpty(error)) {
      this.props.reportError(false);
    }

    this.props.handleChangeFilters({
      ...this.props.filters,
      transactionTime: `none_to_${
        this.props.filters.transactionTime.split("_to_")[1]
      }`,
    });
  };

  clearFilterTo = () => {
    const { from, to } = this.state;
    const error = this.getError("from", from, to);
    this.setState({ to: "none", errorText: error });

    if (isEmpty(error)) {
      this.props.reportError(false);
    }

    this.props.handleChangeFilters({
      ...this.props.filters,
      transactionTime: `${
        this.props.filters.transactionTime.split("_to_")[0]
      }_to_none`,
    });
  };

  setTimeoutChangeFromToFilters = (newFilters) => {
    return setTimeout(
      () => this.props.handleChangeFilters(newFilters),
      oneSecond / 3
    );
  };

  getError = (fromOrTo, from, to) => {
    if (fromOrTo === "from" && !isEmpty(checkDateValidError(from))) {
      return checkDateValidError(from);
    }

    if (fromOrTo === "to" && !isEmpty(checkDateValidError(to))) {
      return checkDateValidError(to);
    }

    if (from !== "none" && to !== "none" && compareTwoDates(from, to) === 1) {
      return "From must < To";
    }

    return "";
  };

  handleChangeValue = (event, fromOrTo) => {
    const { from, to, errorText } = this.state;
    const value = event.target.value === "" ? "none" : event.target.value;
    const newState = {};
    const newFilters = { ...this.props.filters };

    // add to newFilters new transactionTime value
    newFilters.transactionTime =
      fromOrTo === "from" ? `${value}_to_${to}` : `${from}_to_${value}`;

    // adjust new state of from, to
    newState[fromOrTo] = value;

    this.setState(newState, () => {
      // check error: date validation
      const error = this.getError(fromOrTo, this.state.from, this.state.to);

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
      from: this.props.filters.transactionTime.split("_to_")[0],
      to: this.props.filters.transactionTime.split("_to_")[1],
    });
  }

  componentDidUpdate(prevProps) {
    const fromFilters = this.props.filters.transactionTime.split("_to_")[0];
    const toFilters = this.props.filters.transactionTime.split("_to_")[1];

    if (prevProps.clearFlag !== this.props.clearFlag) {
      this.setState({
        from: fromFilters,
        to: toFilters,
        errorText: "",
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["filters"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const { classes } = this.props;

    const { from, to, errorText } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          Transaction Time
        </Button>
        <div className={classes.form}>
          <TextField
            error={!isEmpty(errorText)}
            helperText={!isEmpty(errorText) ? errorText : ""}
            type="text"
            placeholder="From"
            onChange={(event) => this.handleChangeValue(event, "from")}
            value={from === "none" ? "" : from}
            className={classes.mainTextField}
            InputProps={{
              className: classes.inputBase,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disableRipple
                    edge="end"
                    className={clsx(classes.iconButton, {
                      [classes.hide]: from === "none" || from === "",
                    })}
                    onClick={this.clearFilterFrom}
                  >
                    <ClearRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            error={!isEmpty(errorText)}
            helperText="mm/dd/yyyy or m/dd/yyyy or m/d/yyyy"
            type="text"
            placeholder="To"
            onChange={(event) => this.handleChangeValue(event, "to")}
            value={to === "none" ? "" : to}
            className={classes.mainTextField}
            InputProps={{
              className: classes.inputBase,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disableRipple
                    edge="end"
                    className={clsx(classes.iconButton, {
                      [classes.hide]: to === "none" || to === "",
                    })}
                    onClick={this.clearFilterTo}
                  >
                    <ClearRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(TransactionTimeFilter));
