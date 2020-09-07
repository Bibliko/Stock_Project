import React from "react";
import { isEqual, pick } from "lodash";
import clsx from "clsx";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { getFullStockQuote } from "../../../utils/RedisUtil";
import { oneSecond } from "../../../utils/DayTimeUtil";
import { numberWithCommas } from "../../../utils/NumberUtil";
import { changeUserData } from "../../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

import AddBoxRoundedIcon from "@material-ui/icons/AddBoxRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import AttachMoneyRoundedIcon from "@material-ui/icons/AttachMoneyRounded";
import DeleteForeverRoundedIcon from "@material-ui/icons/DeleteForeverRounded";
import AddCircleOutlineRoundedIcon from "@material-ui/icons/AddCircleOutlineRounded";

const styles = (theme) => ({
  tableCell: {
    color: "white",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderColor: "#2D9CDB",
    borderStyle: "solid",
    backgroundColor: theme.palette.paperBackground.deepBlueTable,
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buyButton: {
    color: "#27AE60",
    "&:hover": {
      color: "rgba(39, 174, 96, 0.8)",
    },
    margin: "2px",
    borderRadius: "50%",
    fontSize: "smaller",
    fontWeight: "bold",
    padding: "4px",
  },
  sellButton: {
    color: "#EB5757",
    "&:hover": {
      color: "rgba(235, 87, 87, 0.8)",
    },
    margin: "2px",
    borderRadius: "50%",
    fontSize: "smaller",
    fontWeight: "bold",
    padding: "4px",
  },
  addWatchlistButton: {
    color: "#619FD7",
    "&:hover": {
      color: "rgba(97, 159, 215, 0.8)",
    },
    padding: "5px",
  },
  removeWatchlistButton: {
    padding: "5px",
  },
  watchlistIcon: {
    height: "22px",
    width: "22px",
  },
  removeWatchlistIcon: {
    height: "22px",
    width: "22px",
    color: "white",
    "&:hover": {
      color: "#e23d3d",
    },
  },
  arrowUp: {
    color: "#219653",
  },
  arrowDown: {
    color: "#ef0808",
  },
  marginLeftIfProfitOrLoss: {
    marginLeft: "12px",
  },
  stickyCell: {
    position: "sticky",
    left: 0,
  },
  holdingsTableItem: {
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

class HoldingsTableRow extends React.Component {
  state = {
    lastPrice: "Updating",
    profitOrLoss: "Updating",
    isInWatchlist: false,
  };

  checkStockPriceInterval;

  checkIfProfitOrLoss = (type) => {
    if (type === "Profit/Loss" && this.state.profitOrLoss >= 0) {
      return "Profit";
    }
    if (type === "Profit/Loss" && this.state.profitOrLoss < 0) {
      return "Loss";
    }
  };

  chooseTableCellValue = (type) => {
    const { rowData } = this.props;

    switch (type) {
      case "Code":
        return `${rowData.code}`;

      case "Holding":
        return `${numberWithCommas(rowData.holding)}`;

      case "Buy Price (Avg)":
        return `$${numberWithCommas(rowData.buyPriceAvg.toFixed(2))}`;

      case "Last Price":
        return `$${numberWithCommas(this.state.lastPrice)}`;

      case "Profit/Loss":
        if (parseFloat(this.state.profitOrLoss, 10) < 0) {
          return `-$${numberWithCommas(
            Math.abs(parseFloat(this.state.profitOrLoss, 10))
          )}`;
        }
        return `$${numberWithCommas(this.state.profitOrLoss)}`;

      default:
        return;
    }
  };

  isTableRowTheLast = () => {
    const { rowIndex, rowsLength } = this.props;
    return rowIndex === rowsLength - 1;
  };

  chooseTableCell = (type, classes) => {
    return (
      <TableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.arrowUp]: this.checkIfProfitOrLoss(type) === "Profit",
          [classes.arrowDown]: this.checkIfProfitOrLoss(type) === "Loss",
          [classes.lastLeftCell]: this.isTableRowTheLast() && type === "Code",
          [classes.lastRow]: this.isTableRowTheLast(),
          [classes.stickyCell]: type === "Code",
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.marginLeftIfProfitOrLoss]:
              type === "Profit/Loss" && this.state.profitOrLoss !== "Updating",
          })}
        >
          <Typography className={classes.holdingsTableItem}>
            {this.chooseTableCellValue(type)}
          </Typography>
          {this.checkIfProfitOrLoss(type) === "Profit" && (
            <ArrowDropUpRoundedIcon className={classes.arrowUp} />
          )}
          {this.checkIfProfitOrLoss(type) === "Loss" && (
            <ArrowDropDownRoundedIcon className={classes.arrowDown} />
          )}
        </div>
      </TableCell>
    );
  };

  addToWatchlist = () => {
    const { code } = this.props.rowData;
    const { email, watchlist } = this.props.userSession;
    let newWatchlist = watchlist;

    newWatchlist.push(code);
    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser)
      .then(() => {
        this.setState({
          isInWatchlist: true,
        });
        this.props.openSnackbar(code, "Added");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  removeFromWatchlist = () => {
    const { code } = this.props.rowData;
    const { email, watchlist } = this.props.userSession;
    let newWatchlist = [];
    watchlist.map((companyCodeString) => {
      if (!isEqual(companyCodeString, code)) {
        newWatchlist.push(companyCodeString);
      }
      return "dummy value";
    });

    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser)
      .then(() => {
        this.setState({
          isInWatchlist: false,
        });
        this.props.openSnackbar(code, "Removed");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  setStateIsInWatchlist = () => {
    const { code } = this.props.rowData;
    const { watchlist } = this.props.userSession;

    this.setState({
      isInWatchlist: watchlist.includes(code),
    });
  };

  setStateHoldingInformation = (lastPrice, buyPriceAvg, holding) => {
    let brokerage;

    /**
     * Brokerage ( phí giao dịch )
     * Case 1 : tổng giá trị giao dịch ( sell/buy ) bé hơn bằng 10000 $ thì brokerage = 20 $
     * Case 2 : tổng giá trị trị giao dịch lớn hơn 10 000$ thì brokerage = 20$ + 0.25% ( tổng giá trị giao dịch - 10000 $ )
     * ví dụ : buy/sell lượng cổ phiếu giá 15 000 thì brokerage = 20 + 0.25% * 5000
     */

    if (lastPrice * holding <= 10000) {
      brokerage = 20;
    } else {
      brokerage = 20 + (0.25 / 100) * (lastPrice * holding - 10000);
    }

    if (lastPrice && !isEqual(this.state.lastPrice, lastPrice)) {
      this.setState({
        lastPrice: lastPrice.toFixed(2),
        profitOrLoss: ((lastPrice - buyPriceAvg) * holding - brokerage).toFixed(
          2
        ),
      });
    }
  };

  updateHoldingInformation = () => {
    // const { code, holding, buyPriceAvg } = this.props.rowData;
    // getFullStockQuote(code)
    //   .then((stockQuoteJSON) => {
    //     console.log(stockQuoteJSON);
    //     const { price } = stockQuoteJSON;
    //     this.setStateHoldingInformation(price, buyPriceAvg, holding);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  componentDidMount() {
    this.setStateIsInWatchlist();

    this.updateHoldingInformation();

    this.checkStockPriceInterval = setInterval(
      () => this.updateHoldingInformation(),
      30 * oneSecond
    );
  }

  componentWillUnmount() {
    clearInterval(this.checkStockPriceInterval);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["watchlist"];
    const nextPropsCompareUserSession = pick(
      nextProps.userSession,
      compareKeys
    );
    const propsCompareUserSession = pick(this.props.userSession, compareKeys);

    return (
      !isEqual(nextProps.isMarketClosed, this.props.isMarketClosed) ||
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompareUserSession, propsCompareUserSession)
    );
  }

  render() {
    const { classes } = this.props;
    const { isInWatchlist } = this.state;

    return (
      <TableRow>
        {this.chooseTableCell("Code", classes)}
        {this.chooseTableCell("Holding", classes)}
        {this.chooseTableCell("Buy Price (Avg)", classes)}
        {this.chooseTableCell("Last Price", classes)}
        {this.chooseTableCell("Profit/Loss", classes)}

        <TableCell
          align="center"
          className={clsx(classes.tableCell, {
            [classes.lastRow]: this.isTableRowTheLast(),
          })}
        >
          <div className={classes.cellDiv}>
            <IconButton className={classes.buyButton}>
              <AddCircleOutlineRoundedIcon />
            </IconButton>
            <IconButton className={classes.sellButton}>
              <AttachMoneyRoundedIcon />
            </IconButton>
          </div>
        </TableCell>

        <TableCell
          align="center"
          className={clsx(classes.tableCell, {
            [classes.lastRightCell]: this.isTableRowTheLast(),
            [classes.lastRow]: this.isTableRowTheLast(),
          })}
        >
          <div className={classes.cellDiv}>
            {!isInWatchlist && (
              <IconButton
                className={classes.addWatchlistButton}
                onClick={this.addToWatchlist}
              >
                <AddBoxRoundedIcon className={classes.watchlistIcon} />
              </IconButton>
            )}
            {isInWatchlist && (
              <IconButton
                className={classes.removeWatchlistButton}
                onClick={this.removeFromWatchlist}
              >
                <DeleteForeverRoundedIcon
                  className={classes.removeWatchlistIcon}
                />
              </IconButton>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(HoldingsTableRow)));
