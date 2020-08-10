import React from "react";
import { isEqual } from "lodash";
import clsx from "clsx";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { changeShareData } from "../../../utils/ShareUtil";
import { getStockPriceFromFMP } from "../../../utils/FinancialModelingPrepUtil";
import { oneSecond } from "../../../utils/DayTimeUtil";
import { numberWithCommas } from "../../../utils/NumberUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";

import AddBoxRoundedIcon from "@material-ui/icons/AddBoxRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import AddShoppingCartRoundedIcon from "@material-ui/icons/AddShoppingCartRounded";
import AttachMoneyRoundedIcon from "@material-ui/icons/AttachMoneyRounded";

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
  watchlistButton: {
    color: "#619FD7",
    "&:hover": {
      color: "rgba(97, 159, 215, 0.8)",
    },
    padding: "5px",
  },
  watchlistIcon: {
    height: "30px",
    width: "30px",
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
          {this.chooseTableCellValue(type)}
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

    if (!isEqual(this.state.lastPrice, lastPrice)) {
      this.setState({
        lastPrice: lastPrice.toFixed(2),
        profitOrLoss: ((lastPrice - buyPriceAvg) * holding - brokerage).toFixed(
          2
        ),
      });
    }
  };

  updateHoldingInformation = () => {
    const { id, code, holding, buyPriceAvg, lastPrice } = this.props.rowData;

    console.log(lastPrice);

    if (this.props.isMarketClosed) {
      this.setStateHoldingInformation(lastPrice, buyPriceAvg, holding);
    } else {
      // getStockPriceFromFMP(code)
      // .then(stockQuoteJSON => {
      //     const { price } = stockQuoteJSON;
      //     const dataNeedChange = {
      //         lastPrice: price
      //     };
      //     if(
      //         !isEqual(this.state.lastPrice, 'Updating') &&
      //         !isEqual(this.state.lastPrice, price)
      //     ) {
      //         return changeShareData(dataNeedChange, id);
      //     }
      //     this.setStateHoldingInformation(price, buyPriceAvg, holding);
      // })
      // .catch(err => {
      //     console.log(err);
      // })
    }
  };

  componentDidMount() {
    this.checkStockPriceInterval = setInterval(
      () => this.updateHoldingInformation(),
      5 * oneSecond
      // 20 * oneSecond
    );
  }

  componentWillUnmount() {
    clearInterval(this.checkStockPriceInterval);
  }

  render() {
    const { classes } = this.props;

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
              <AddShoppingCartRoundedIcon />
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
            <IconButton className={classes.watchlistButton}>
              <AddBoxRoundedIcon className={classes.watchlistIcon} />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = (state) => ({
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(HoldingsTableRow)));
