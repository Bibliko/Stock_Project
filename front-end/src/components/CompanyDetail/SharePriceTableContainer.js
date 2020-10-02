import React from "react";
import clsx from "clsx";

//import SharePriceTableRow from "./SharePriceTableRow";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";

const styles = (theme) => ({
  table: {
    width: "100%",
    borderCollapse: "separate",
  },
  tableContainer: {
    borderRadius: "4px",
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  tableCellChangePercent: {
    minWidth: "120px",
  },
  tableCell: {
    fontSize: "16px",
    borderWidth: "1px",
    borderColor: "#9ED2EF",
    borderStyle: "solid",
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#9ED2EF",
  },
  body: {
    backgroundColor: "#1E1E1E",
    fontSize: 14,
  },
}))(TableCell);

class SharePriceTableContainer extends React.Component {
  chooseTableCell = (type, classes) => {
    return (
      <StyledTableCell align="center" className={clsx(classes.tableCell)}>
        {type}
      </StyledTableCell>
    );
  };

  render() {
    const { classes, rows } = this.props;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {this.chooseTableCell("Code", classes)}
              {this.chooseTableCell("Last price", classes)}
              {this.chooseTableCell("Change %", classes)}
              {this.chooseTableCell("Change $", classes)}
              {this.chooseTableCell("Bid", classes)}
              {this.chooseTableCell("Offer", classes)}
              {this.chooseTableCell("Last", classes)}
              {this.chooseTableCell("Open", classes)}
              {this.chooseTableCell("High", classes)}
              {this.chooseTableCell("Low", classes)}
              {this.chooseTableCell("Volume", classes)}
              {this.chooseTableCell("Actions", classes)}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
              {this.chooseTableCell("", classes)}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(SharePriceTableContainer);
