import React from "react";
import { withRouter } from "react-router";

import { chooseTableCell } from "./helperComponents";

import { withStyles } from "@material-ui/core/styles";
import { TableRow } from "@material-ui/core";

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
    justifyContent: "flex-end",
  },
  cellDivSpecialForType: {
    justifyContent: "flex-start",
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

  render() {
    const { classes, transactionInfo } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        {chooseTableCell(
          "Type",
          this.isTableRowTheLast,
          classes,
          transactionInfo
        )}
        {chooseTableCell(
          "Code",
          this.isTableRowTheLast,
          classes,
          transactionInfo
        )}
        {chooseTableCell(
          "Quantity",
          this.isTableRowTheLast,
          classes,
          transactionInfo
        )}
        {chooseTableCell(
          "Price",
          this.isTableRowTheLast,
          classes,
          transactionInfo
        )}
        {chooseTableCell(
          "Gain/Loss",
          this.isTableRowTheLast,
          classes,
          transactionInfo
        )}
        {chooseTableCell(
          "Transaction Time",
          this.isTableRowTheLast,
          classes,
          transactionInfo
        )}
      </TableRow>
    );
  }
}

export default withStyles(styles)(withRouter(TransactionsHistoryTableRow));
