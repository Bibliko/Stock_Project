import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";

import HoldingsTableRow from "./HoldingsTableRow";

import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Snackbar,
} from "@material-ui/core";

import { Alert as MuiAlert } from "@material-ui/lab";

const styles = (theme) => ({
  table: {
    width: "100%",
    borderCollapse: "separate",
  },
  tableContainer: {
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
  },
  tableCellProfitOrLoss: {
    minWidth: "120px",
  },
  tableCell: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    borderWidth: "1px",
    borderColor: theme.palette.paperBackground.sub,
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
    borderTopLeftRadius: "4px",
  },
  lastElementTopRightRounded: {
    borderTopRightRadius: "4px",
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.paperBackground.sub,
    color: "white",
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
          [classes.stickyCell]: type === "Code" && !this.props.minimal,
          [classes.lastElementTopRightRounded]: type === "Watchlist",
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
      companyCodeOnAction: `${AddedOrRemoved} ${companyCode} ${AddedOrRemoved === "Added" ? "to" : "from"}`,
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
    return (
      !isEqual(nextProps, this.props) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, rows, minimal } = this.props;
    const { openSnackbar, companyCodeOnAction } = this.state;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {this.chooseTableCell("Code", classes)}
              {!minimal && this.chooseTableCell("Holding", classes)}
              {!minimal && this.chooseTableCell("Buy Price (Avg)", classes)}
              {!minimal && this.chooseTableCell("Last Price", classes)}
              {this.chooseTableCell("Profit/Loss", classes)}
              {!minimal && this.chooseTableCell("Watchlist", classes)}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {rows.map((row, index) => (
              <HoldingsTableRow
                minimal={minimal}
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
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={openSnackbar}
          autoHideDuration={6 * oneSecond}
          onClose={this.handleCloseSnackbar}
        >
          <Alert onClose={this.handleCloseSnackbar} severity="success">
            {`${companyCodeOnAction} watchlist successfully!`}
          </Alert>
        </Snackbar>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(withRouter(HoldingsTableContainer));
