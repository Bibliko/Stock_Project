import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/DayTimeUtil";

import HoldingsTableRow from "./HoldingsTableRow";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import Snackbar from "@material-ui/core/Snackbar";

import MuiAlert from "@material-ui/lab/Alert";

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
  tableCellProfitOrLoss: {
    minWidth: "120px",
  },
  tableCell: {
    fontSize: "12px",
    borderWidth: "1px",
    borderColor: "#9ED2EF",
    borderStyle: "solid",
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  widthIfBuyPriceOrLastPrice: {
    minWidth: "100px",
  },
  stickyCell: {
    position: "sticky",
    left: 0,
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#9ED2EF",
  },
}))(TableCell);

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class HoldingsTableContainer extends React.Component {
  state = { openSnackbar: false, companyCodeOnAction: "" };

  chooseTableCell = (type, classes) => {
    return (
      <StyledTableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.tableCellProfitOrLoss]: type === "Profit/Loss",
          [classes.stickyCell]: type === "Code",
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.widthIfBuyPriceOrLastPrice]:
              type === "Buy Price (Avg)" || type === "Last Price",
          })}
        >
          {type}
        </div>
      </StyledTableCell>
    );
  };

  handleOpenSnackbar = (companyCode, AddedOrRemoved) => {
    this.setState({
      openSnackbar: true,
      companyCodeOnAction: `${AddedOrRemoved} ${companyCode}`,
    });
  };

  handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({
      openSnackbar: false,
      companyCodeOnAction: "",
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
  }

  render() {
    const { classes, rows } = this.props;
    const { openSnackbar, companyCodeOnAction } = this.state;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {this.chooseTableCell("Code", classes)}
              {this.chooseTableCell("Holding", classes)}
              {this.chooseTableCell("Buy Price (Avg)", classes)}
              {this.chooseTableCell("Last Price", classes)}
              {this.chooseTableCell("Profit/Loss", classes)}
              {this.chooseTableCell("Actions", classes)}
              {this.chooseTableCell("Watchlist", classes)}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {rows.map((row, index) => (
              <HoldingsTableRow
                key={row.id}
                rowData={row}
                rowIndex={index}
                rowsLength={rows.length}
                openSnackbar={this.handleOpenSnackbar}
              />
            ))}
          </TableBody>
        </Table>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6 * oneSecond}
          onClose={this.handleCloseSnackbar}
        >
          <Alert onClose={this.handleCloseSnackbar} severity="success">
            {`${companyCodeOnAction} from watchlist successfully!`}
          </Alert>
        </Snackbar>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(withRouter(HoldingsTableContainer));
