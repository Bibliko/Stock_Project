import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";
import { isEqual, pick } from "lodash";
import { socket } from "../../../App";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import {
  numberWithCommas,
  simplifyNumber,
  roundNumber,
} from "../../../utils/low-dependency/NumberUtil";
import { getFullStockInfo } from "../../../utils/RedisUtil";
import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import { changeUserData } from "../../../utils/UserUtil";
import { redirectToPage } from "../../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { TableRow, TableCell, Typography } from "@material-ui/core";

import {
  ArrowDropUpRounded as ArrowDropUpRoundedIcon,
  ArrowDropDownRounded as ArrowDropDownRoundedIcon,
  DeleteForeverRounded as DeleteForeverRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  tableCell: {
    color: "white",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderColor: theme.palette.secondary.main,
    borderStyle: "solid",
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  tableRow: {
    background: "transparent",
    backgroundColor: "transparent",
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cellDivName: {
    justifyContent: "flex-start",
  },
  watchlistIcon: {
    height: "30px",
    width: "30px",
  },
  arrowUp: {
    color: theme.palette.success.main,
  },
  arrowDown: {
    color: theme.palette.fail.main,
  },
  marginLeftIfProfitOrLoss: {
    marginLeft: "12px",
  },
  iconInsideIconButton: {
    height: "22px",
    width: "22px",
    color: theme.palette.fail.main,
    "&:hover": {
      color: theme.palette.fail.mainHover,
      cursor: "pointer",
    },
  },
  stickyCell: {
    position: "sticky",
    left: 0,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
      color: theme.palette.secondary.main,
    },
  },
  watchlistRowItem: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },

  // border section
  lastLeftCell: {
    borderBottomLeftRadius: "4px",
  },
  lastRightCell: {
    borderBottomRightRadius: "4px",
  },
  lastRow: {
    borderBottomWidth: "1px",
  },
});

class WatchlistTableRow extends React.Component {
  state = {
    name: this.props.companyCode,
    price: 0,
    volume: 0,
    changesPercentage: 0,
    marketCap: 0,
  };

  intervalForUpdateShareInfo;

  checkIfChangeIncreaseOrDecrease = (type) => {
    if (type === "Change %" && this.state.changesPercentage >= 0) {
      return "Increase";
    }
    if (type === "Change %" && this.state.changesPercentage < 0) {
      return "Decrease";
    }
  };

  chooseTableCell = (type, classes) => {
    return (
      <TableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.arrowUp]:
            this.checkIfChangeIncreaseOrDecrease(type) === "Increase",
          [classes.arrowDown]:
            this.checkIfChangeIncreaseOrDecrease(type) === "Decrease",
          [classes.lastLeftCell]: this.isTableRowTheLast() && type === "Code",
          [classes.lastRow]: this.isTableRowTheLast(),
          [classes.stickyCell]: type === "Code",
        })}
        onClick={
          type === "Code"
          ? () => redirectToPage(`company/${this.props.companyCode}`, this.props)
          : undefined
        }
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.marginLeftIfProfitOrLoss]: type === "Change %",
            [classes.cellDivName]: type === "Name",
          })}
        >
          <Typography className={classes.watchlistRowItem} noWrap>
            {this.chooseTableCellValue(type)}
          </Typography>
          {this.checkIfChangeIncreaseOrDecrease(type) === "Increase" && (
            <ArrowDropUpRoundedIcon className={classes.arrowUp} />
          )}
          {this.checkIfChangeIncreaseOrDecrease(type) === "Decrease" && (
            <ArrowDropDownRoundedIcon className={classes.arrowDown} />
          )}
        </div>
      </TableCell>
    );
  };

  chooseTableCellValue = (type) => {
    const { companyCode } = this.props;

    switch (type) {
      case "Code":
        return `${companyCode}`;

      case "Name":
        return `${this.state.name}`;

      case "Price":
        return `$${numberWithCommas(roundNumber(this.state.price, 2))}`;

      case "Volume":
        return `${simplifyNumber(this.state.volume, 2)}`;

      case "Change %":
        if (this.state.changesPercentage < 0) {
          return `-${numberWithCommas(
            roundNumber(Math.abs(this.state.changesPercentage), 2)
          )}%`;
        }
        return `${numberWithCommas(
          roundNumber(this.state.changesPercentage, 2)
        )}%`;

      case "Market Cap":
        return `${simplifyNumber(this.state.marketCap)}`;

      default:
        return;
    }
  };

  isTableRowTheLast = () => {
    const { rowIndex, rowsLength } = this.props;
    return rowIndex === rowsLength - 1;
  };

  removeFromWatchlist = () => {
    const { companyCode } = this.props;
    const { watchlist, email } = this.props.userSession;

    let newWatchlist = [];
    watchlist.forEach((companyCodeString) => {
      if (!isEqual(companyCodeString, companyCode)) {
        newWatchlist.push(companyCodeString);
      }
    });

    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser, socket)
      .then((res) => {
        this.props.openSnackbar(companyCode);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  setStateStockQuote = (stockQuoteJSON) => {
    const neededAttribute = [
      "name",
      "price",
      "volume",
      "changesPercentage",
      "marketCap",
    ];
    const necessaryInfo = pick(stockQuoteJSON, neededAttribute);
    const infoFromState = pick(this.state, neededAttribute);
    if (!isEqual(infoFromState, necessaryInfo)) {
      this.setState({
        ...this.state,
        ...necessaryInfo,
      });
    }
  };

  setStateShareInfo = () => {
    // TODO: Uncomment this in production
    const { companyCode } = this.props;
    getFullStockInfo(companyCode)
      .then((fullStockInfo) => {
        console.log(fullStockInfo);
        this.setStateStockQuote(fullStockInfo);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  setupAndUpdateWatchlistComponent = () => {
    const { isMarketClosed } = this.props;

    this.setStateShareInfo();

    if (!isMarketClosed) {
      if (!this.intervalForUpdateShareInfo) {
        this.intervalForUpdateShareInfo = setInterval(
          this.setStateShareInfo,
          30 * oneSecond
        );
      }
    } else {
      clearInterval(this.intervalForUpdateShareInfo);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.companyCode !== prevProps.companyCode)
      this.setStateShareInfo();
  }

  componentDidMount() {
    this.setupAndUpdateWatchlistComponent();
  }

  componentWillUnmount() {
    clearInterval(this.intervalForUpdateShareInfo);
  }

  render() {
    const { classes } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        {this.chooseTableCell("Code", classes)}
        {this.chooseTableCell("Name", classes)}
        {this.chooseTableCell("Price", classes)}
        {this.chooseTableCell("Volume", classes)}
        {this.chooseTableCell("Change %", classes)}
        {this.chooseTableCell("Market Cap", classes)}

        <TableCell
          align="center"
          className={clsx(classes.tableCell, {
            [classes.lastRow]: this.isTableRowTheLast(),
            [classes.lastRightCell]: this.isTableRowTheLast(),
          })}
        >
          <div className={classes.cellDiv}>
            <DeleteForeverRoundedIcon
              className={classes.iconInsideIconButton}
              onClick={this.removeFromWatchlist}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = (state) => ({
  isMarketClosed: state.isMarketClosed,
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(WatchlistTableRow)));
