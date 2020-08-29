import React from "react";
import clsx from "clsx";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";

import TransactionsHistoryTableRow from "./TransactionsHistoryTableRow";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import { Typography, Paper } from "@material-ui/core";
import TablePagination from "@material-ui/core/TablePagination";

import AssignmentRoundedIcon from "@material-ui/icons/AssignmentRounded";

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
  emptyRowsPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "200px",
    color: "white",
    padding: 20,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  assignmentIcon: {
    height: "50px",
    width: "auto",
    marginBottom: "5px",
    [theme.breakpoints.down("xs")]: {
      height: "40px",
    },
  },
  "@keyframes bounceIcon": {
    "0%": { transform: "scale(1,1) translateY(0)" },
    "10%": { transform: "scale(1.1,.9) translateY(0)" },
    "30%": { transform: "scale(.9,1.1) translateY(-50px)" },
    "50%": { transform: "scale(1.05,.95) translateY(0)" },
    "57%": { transform: "scale(1,1) translateY(-7px)" },
    "64%": { transform: "scale(1,1) translateY(0)" },
    "100%": { transform: "scale(1,1) translateY(0)" },
  },
  assignmentIconAnimation: {
    animation: "2s infinite $bounceIcon",
    animationTimingFunction: "cubic-bezier(0.280, 0.840, 0.420, 1)",
  },
  assignmentWord: {
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    textAlign: "center",
  },
  transactionsHistoryContainerDiv: {
    width: "100%",
    marginTop: "24px",
  },
  firstElementTopLeftRounded: {
    borderTopLeftRadius: "4px",
  },
  lastElementTopRightRounded: {
    borderTopRightRadius: "4px",
  },
  tablePagination: {
    color: "white",
  },
  tablePaginationSelectIcon: {
    color: "white",
  },
  tablePaginationActions: {
    "& .Mui-disabled": {
      color: theme.palette.disabled.whiteColor,
    },
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#9ED2EF",
  },
}))(TableCell);

class TransactionsHistoryTableContainer extends React.Component {
  state = {
    hoverPaper: false,

    rowsPerPage: 10,
    page: 0,
  };

  hoverPaper = () => {
    this.setState({
      hoverPaper: true,
    });
  };

  notHoverPaper = () => {
    this.setState({
      hoverPaper: false,
    });
  };

  chooseTableCell = (type, classes) => {
    return (
      <StyledTableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.firstElementTopLeftRounded]: type === "Type",
          [classes.lastElementTopRightRounded]: type === "Transaction Time",
        })}
      >
        <div className={classes.cellDiv}>{type}</div>
      </StyledTableCell>
    );
  };

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  render() {
    const { classes, rows } = this.props;
    const { hoverPaper, rowsPerPage, page } = this.state;

    return (
      <div className={classes.transactionsHistoryContainerDiv}>
        {isEmpty(rows) && (
          <Paper
            className={classes.emptyRowsPaper}
            onMouseEnter={this.hoverPaper}
            onMouseLeave={this.notHoverPaper}
          >
            <AssignmentRoundedIcon
              className={clsx(classes.assignmentIcon, {
                [classes.assignmentIconAnimation]: hoverPaper,
              })}
            />
            <Typography className={classes.assignmentWord}>
              Start by making some transactions by selling or buying stocks!
            </Typography>
          </Paper>
        )}
        {!isEmpty(rows) && (
          <TableContainer className={classes.tableContainer}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {this.chooseTableCell("Type", classes)}
                  {this.chooseTableCell("Code", classes)}
                  {this.chooseTableCell("Quantity", classes)}
                  {this.chooseTableCell("Price", classes)}
                  {this.chooseTableCell("Brokerage", classes)}
                  {this.chooseTableCell("Spend/Gain", classes)}
                  {this.chooseTableCell("Transaction Time", classes)}
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {rows.map((row, index) => (
                  <TransactionsHistoryTableRow
                    key={index}
                    transactionInfo={row}
                    rowIndex={index}
                    rowsLength={rows.length}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!isEmpty(rows) && (
          <TablePagination
            classes={{
              selectIcon: classes.tablePaginationSelectIcon,
              actions: classes.tablePaginationActions,
            }}
            className={classes.tablePagination}
            rowsPerPageOptions={[5, 10]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(
  withRouter(TransactionsHistoryTableContainer)
);
