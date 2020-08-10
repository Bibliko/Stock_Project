import React from "react";
import clsx from "clsx";
import { isEqual, isEmpty } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/DayTimeUtil";

import WatchlistTableRow from "./WatchlistTableRow";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import Snackbar from "@material-ui/core/Snackbar";
import { Typography, Paper } from "@material-ui/core";

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
  tableCell: {
    minWidth: "100px",
    fontSize: "12px",
    borderWidth: "1px",
    borderColor: "#9ED2EF",
    borderStyle: "solid",
  },
  tableCellName: {
    minWidth: "150px",
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cellDivName: {
    justifyContent: "flex-start",
  },
  emptyRowsPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    color: "white",
    fontSize: "large",
    padding: 10,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  watchlistContainerDiv: {
    width: "100%",
    marginTop: "24px",
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

class WatchlistTableContainer extends React.Component {
  state = {
    openSnackbar: false,
    companyCodeRemoved: "",
  };

  handleOpenSnackbar = (companyCode) => {
    this.setState({
      openSnackbar: true,
      companyCodeRemoved: companyCode,
    });
  };

  handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({
      openSnackbar: false,
    });
  };

  chooseTableCell = (type, classes) => {
    return (
      <StyledTableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.tableCellName]: type === "Name",
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.cellDivName]: type === "Name",
          })}
        >
          {type}
        </div>
      </StyledTableCell>
    );
  };

  render() {
    const { classes, rows } = this.props;
    const { openSnackbar, companyCodeRemoved } = this.state;

    return (
      <div className={classes.watchlistContainerDiv}>
        {isEmpty(rows) && (
          <Paper className={classes.emptyRowsPaper}>
            <Typography>
              Start by adding more companies to your list!
            </Typography>
          </Paper>
        )}
        {!isEmpty(rows) && (
          <TableContainer className={classes.tableContainer}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {this.chooseTableCell("Name", classes)}
                  {this.chooseTableCell("Code", classes)}
                  {this.chooseTableCell("Price", classes)}
                  {this.chooseTableCell("Volume", classes)}
                  {this.chooseTableCell("Change %", classes)}
                  {this.chooseTableCell("Market Cap", classes)}
                  {this.chooseTableCell(" ", classes)}
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {rows.map(
                  (row, index) =>
                    !isEqual(row, companyCodeRemoved) && (
                      <WatchlistTableRow
                        key={index}
                        companyCode={row}
                        rowIndex={index}
                        rowsLength={rows.length}
                        openSnackbar={this.handleOpenSnackbar}
                      />
                    )
                )}
              </TableBody>
            </Table>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6 * oneSecond}
              onClose={this.handleCloseSnackbar}
            >
              <Alert onClose={this.handleCloseSnackbar} severity="success">
                {`Removed ${companyCodeRemoved} from watchlist successfully!`}
              </Alert>
            </Snackbar>
          </TableContainer>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(WatchlistTableContainer));
