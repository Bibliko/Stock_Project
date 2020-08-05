import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { numberWithCommas } from "../../../utils/NumberUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Button from "@material-ui/core/Button";

import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";

const styles = (theme) => ({
  tableCell: {
    color: "white",
    borderLeftWidth: "1px",
    borderRightWidth: "0px",
    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderColor: "#2D9CDB",
    borderStyle: "solid",
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
  buyButton: {
    backgroundColor: "#27AE60",
    "&:hover": {
      backgroundColor: "rgba(39, 174, 96, 0.8)",
    },
    margin: "2px",
    borderRadius: "10px",
    fontSize: "smaller",
    fontWeight: "bold",
    padding: "4px",
  },
  sellButton: {
    backgroundColor: "#EB5757",
    "&:hover": {
      backgroundColor: "rgba(235, 87, 87, 0.8)",
    },
    margin: "2px",
    borderRadius: "10px",
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
  watchlistBorder: {
    borderRightWidth: "1px",
  },
});

class WatchlistTableRow extends React.Component {
  state = {
    bid: 0,
    offer: 0,
    last: 0,
    open: 0,
    high: 0,
    low: 0,
    volume: 0,
    changePercent: 0,
  };

  checkIfChangeIncreaseOrDecrease = (type) => {
    if (type === "Change %" && this.state.changePercent >= 0) {
      return "Increase";
    }
    if (type === "Change %" && this.state.changePercent < 0) {
      return "Decrease";
    }
  };

  chooseTableCellValue = (type) => {
    const { companyCode } = this.props;

    switch (type) {
      case "Code":
        return `${companyCode}`;

      case "Bid":
        return `${numberWithCommas(this.state.bid)}`;

      case "Offer":
        return `$${numberWithCommas(this.state.offer)}`;

      case "Last":
        return `$${numberWithCommas(this.state.last.toFixed(2))}`;

      case "Open":
        return `$${numberWithCommas(this.state.open.toFixed(2))}`;

      case "High":
        return `$${numberWithCommas(this.state.high.toFixed(2))}`;

      case "Low":
        return `$${numberWithCommas(this.state.low.toFixed(2))}`;

      case "Volume":
        return `$${numberWithCommas(this.state.volume.toFixed(2))}`;

      case "Change %":
        if (this.state.changePercent < 0) {
          return `-$${numberWithCommas(
            Math.abs(this.state.changePercent).toFixed(2)
          )}`;
        }
        return `$${numberWithCommas(this.state.changePercent.toFixed(2))}`;

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
          [classes.arrowUp]:
            this.checkIfChangeIncreaseOrDecrease(type) === "Increase",
          [classes.arrowDown]:
            this.checkIfChangeIncreaseOrDecrease(type) === "Decrease",
          [classes.lastLeftCell]: this.isTableRowTheLast() && type === "Code",
          [classes.lastRow]: this.isTableRowTheLast(),
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.marginLeftIfProfitOrLoss]: type === "Change %",
          })}
        >
          {this.chooseTableCellValue(type)}
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

  updateWatchlistRowInformation = () => {
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
  };

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { classes } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        {this.chooseTableCell("Code", classes)}
        {this.chooseTableCell("Bid", classes)}
        {this.chooseTableCell("Offer", classes)}
        {this.chooseTableCell("Last", classes)}
        {this.chooseTableCell("Open", classes)}
        {this.chooseTableCell("High", classes)}
        {this.chooseTableCell("Low", classes)}
        {this.chooseTableCell("Volume", classes)}
        {this.chooseTableCell("Change %", classes)}

        <TableCell
          align="center"
          className={clsx(classes.tableCell, classes.watchlistBorder, {
            [classes.lastRow]: this.isTableRowTheLast(),
            [classes.lastRightCell]: this.isTableRowTheLast(),
          })}
        >
          <div className={classes.cellDiv}>
            <Button className={classes.buyButton}>Buy</Button>
            <Button className={classes.sellButton}>Sell</Button>
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
)(withStyles(styles)(withRouter(WatchlistTableRow)));
