import React from "react";
import clsx from "clsx";
import { isEqual, pick, isEmpty } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";

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
  hide: {
    display: "none",
  },
});

/**
  Props: 
  reportError={this.reportError}
  clearFlag={clearTemporaryValuesFlag}
  handleChangeFilters={handleChangeFilters}
  filters={filters}
 */
class CodeFilter extends React.Component {
  state = {
    codeValue: "none",
    errorCodeText: "",
  };

  timeoutToUpdateFilterCode;

  /**
    Ticker Symbol Basics
    Stock or equity symbols are the most known type of ticker symbol. 
    Stocks listed and traded on U.S. exchanges such as 
    ...the New York Stock Exchange (NYSE) have ticker symbols with up to three letters. 
    Nasdaq-listed stocks have four-letter ticker symbols. 

    stock ticker symbol maximum length: 5 characters (search Google)
   */
  checkErrorCode = (codeValue) => {
    if (codeValue.indexOf(";") >= 0) {
      return "No ';' in Code is allowed";
    }
    if (codeValue.length >= 6) {
      return "No more than 6 characters";
    }
    return "";
  };

  setTimeoutChangeCode = () => {
    this.timeoutToUpdateFilterCode = setTimeout(() => {
      this.props.handleChangeFilters({
        ...this.props.filters,
        code:
          this.state.codeValue === ""
            ? "none"
            : this.state.codeValue.toUpperCase(),
      });
    }, oneSecond / 3);
  };

  handleChangeCode = (event) => {
    const { errorCodeText } = this.state;

    if (this.timeoutToUpdateFilterCode) {
      clearTimeout(this.timeoutToUpdateFilterCode);
    }

    this.setState(
      {
        codeValue: event.target.value,
      },
      () => {
        // check error
        const error = this.checkErrorCode(this.state.codeValue);
        if (isEmpty(error)) {
          if (!isEmpty(errorCodeText)) {
            this.props.reportError(false);
          }
          this.setState({ errorCodeText: "" });

          this.setTimeoutChangeCode();
        } else {
          if (isEmpty(errorCodeText)) {
            this.props.reportError(true);
          }
          this.setState({ errorCodeText: error });
        }
      }
    );
  };

  clearCodeFilter = () => {
    this.setState({ codeValue: "none", errorCodeText: "" });
    this.props.reportError(false);

    this.props.handleChangeFilters({
      ...this.props.filters,
      code: "none",
    });
  };

  componentDidMount() {
    this.setState({
      codeValue: this.props.filters.code,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.clearFlag !== this.props.clearFlag) {
      this.setState({
        codeValue: this.props.filters.code,
        errorCodeText: "",
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "clearFlag", "filters"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    const { codeValue, errorCodeText } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          Code
        </Button>
        <TextField
          error={!isEmpty(errorCodeText)}
          helperText={!isEmpty(errorCodeText) ? errorCodeText : ""}
          onChange={this.handleChangeCode}
          value={codeValue === "none" ? "" : codeValue}
          className={classes.mainTextField}
          InputProps={{
            className: classes.inputBase,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disableRipple
                  edge="end"
                  className={clsx(classes.iconButton, {
                    [classes.hide]: codeValue === "none" || codeValue === "",
                  })}
                  onClick={this.clearCodeFilter}
                >
                  <ClearRoundedIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(CodeFilter));
