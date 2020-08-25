import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";

import { numberWithCommas } from "../../../utils/NumberUtil";
import { convertToLocalTimeString } from "../../../utils/DayTimeUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";

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
  iconInsideIconButton: {
    height: "22px",
    width: "22px",
    color: "white",
    "&:hover": {
      color: "#e23d3d",
      cursor: "pointer",
    },
  },
  stickyCell: {
    position: "sticky",
    left: 0,
  },
  watchlistRowItem: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
  buyIcon: {
    color: "#27AE60",
  },
  sellIcon: {
    color: "#EB5757",
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

class TransactionsHistoryTableRow extends React.Component {
  isTableRowTheLast = () => {
    const { rowIndex, rowsLength } = this.props;
    return rowIndex === rowsLength - 1;
  };

  chooseTableCell = (type, classes) => {
    const { isTypeBuy } = this.props.transactionInfo;

    return (
      <TableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.lastRow]: this.isTableRowTheLast(),
          [classes.lastLeftCell]: this.isTableRowTheLast() && type === "Type",
          [classes.lastRightCell]:
            this.isTableRowTheLast() && type === "Transaction Time",
        })}
      >
        <div className={classes.cellDiv}>
          <Typography
            className={clsx(classes.watchlistRowItem, {
              [classes.buyIcon]: type === "Type" && isTypeBuy,
              [classes.sellIcon]: type === "Type" && !isTypeBuy,
            })}
            noWrap
          >
            {this.chooseTableCellValue(type)}
          </Typography>
        </div>
      </TableCell>
    );
  };

  chooseTableCellValue = (type, classes) => {
    const {
      isTypeBuy,
      companyCode,
      quantity,
      priceAtTransaction,
      brokerage,
      finishedTime,
    } = this.props.transactionInfo;

    switch (type) {
      case "Type":
        return isTypeBuy ? "Buy/Spend" : "Sell/Gain";

      case "Code":
        return `${companyCode}`;

      case "Quantity":
        return `${numberWithCommas(quantity)}`;

      case "Price":
        return `$${numberWithCommas(priceAtTransaction.toFixed(2))}`;

      case "Brokerage":
        return `$${numberWithCommas(brokerage.toFixed(2))}`;

      case "Spend/Gain":
        let totalValue = 0;
        if (isTypeBuy) {
          totalValue = priceAtTransaction * quantity + brokerage;
        } else {
          totalValue = priceAtTransaction * quantity - brokerage;
        }
        return `$${numberWithCommas(totalValue.toFixed(2))}`;

      case "Transaction Time":
        return convertToLocalTimeString(finishedTime);

      default:
        return;
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        {this.chooseTableCell("Type", classes)}
        {this.chooseTableCell("Code", classes)}
        {this.chooseTableCell("Quantity", classes)}
        {this.chooseTableCell("Price", classes)}
        {this.chooseTableCell("Brokerage", classes)}
        {this.chooseTableCell("Spend/Gain", classes)}
        {this.chooseTableCell("Transaction Time", classes)}
      </TableRow>
    );
  }
}

export default withStyles(styles)(withRouter(TransactionsHistoryTableRow));
