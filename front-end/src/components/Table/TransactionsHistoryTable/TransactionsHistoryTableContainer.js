import React from "react";
import clsx from "clsx";
import { isEmpty, isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import TransactionsHistoryTableRow from "./TransactionsHistoryTableRow";

import { parseRedisTransactionsHistoryListItem } from "../../../utils/RedisUtil";
import { getUserTransactionsHistory } from "../../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import { Typography, Paper } from "@material-ui/core";
import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from "@material-ui/core/TableSortLabel";

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
  skeleton: {
    width: "100%",
    height: "200px",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
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
    loading: true,

    rowsLengthChoices: [1, 5, 10], // min to max
    rowsPerPage: 5,
    pageBase0: 0,
    searchBy: "none",
    searchQuery: "none",
    orderBy: "finishedTime",
    orderQuery: "desc",

    transactions: [],
    transactionsLength: 0,

    names: [
      "Type",
      "Code",
      "Quantity",
      "Price",
      "Brokerage",
      "Spend/Gain",
      "Transaction Time",
    ],
    prismaNames: [
      "",
      "companyCode",
      "quantity",
      "priceAtTransaction",
      "brokerage",
      "spendOrGain",
      "finishedTime",
    ],
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

  handleRequestSort = (event, property) => {
    const { orderBy, orderQuery } = this.state;
    const isAsc = orderBy === property && orderQuery === "asc";

    this.setState(
      {
        orderBy: property,
        orderQuery: isAsc ? "desc" : "asc",
      },
      () => {
        this.getUserTransactionsHistoryPageData();
      }
    );
  };

  createSortHandler = (property) => (event) => {
    this.handleRequestSort(event, property);
  };

  chooseTableCell = (indexInNamesState, classes) => {
    const { orderBy, orderQuery, names, prismaNames } = this.state;
    const type = names[indexInNamesState];
    const prismaType = prismaNames[indexInNamesState];

    return (
      <StyledTableCell
        key={indexInNamesState}
        align={type === "Type" ? "left" : "right"}
        className={clsx(classes.tableCell, {
          [classes.firstElementTopLeftRounded]: type === "Type",
          [classes.lastElementTopRightRounded]: type === "Transaction Time",
        })}
        sortDirection={orderBy === prismaType ? orderQuery : false}
      >
        <TableSortLabel
          active={orderBy === prismaType}
          direction={orderBy === prismaType ? orderQuery : "asc"}
          onClick={this.createSortHandler(prismaType)}
          className={clsx(classes.cellDiv, {
            [classes.cellDivSpecialForType]: type === "Type",
          })}
          disabled={type === "Type"}
        >
          {type}
          {orderBy === prismaType ? (
            <span className={classes.visuallyHidden}>
              {orderQuery === "desc" ? "sorted descending" : "sorted ascending"}
            </span>
          ) : null}
        </TableSortLabel>
      </StyledTableCell>
    );
  };

  setStateTransactions = (redisTransactions) => {
    let newTransactions = [];

    const { transactions, transactionsLength } = redisTransactions;

    transactions.map((transaction) => {
      newTransactions.push(parseRedisTransactionsHistoryListItem(transaction));
      return "dummy value";
    });
    this.setState({
      transactions: newTransactions,
      transactionsLength,
      loading: false,
    });
  };

  getUserTransactionsHistoryPageData = () => {
    const { email } = this.props.userSession;
    const {
      rowsLengthChoices,
      pageBase0,
      rowsPerPage,
      searchBy,
      searchQuery,
      orderBy,
      orderQuery,
    } = this.state;

    getUserTransactionsHistory(
      email,
      rowsLengthChoices,
      pageBase0 + 1,
      rowsPerPage,
      searchBy,
      searchQuery,
      orderBy,
      orderQuery
    )
      .then((redisTransactions) => {
        this.setStateTransactions(redisTransactions);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleChangePage = (event, newPage) => {
    this.setState({ pageBase0: newPage }, () => {
      this.getUserTransactionsHistoryPageData();
    });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState(
      {
        rowsPerPage: parseInt(event.target.value, 10),
        pageBase0: 0,
      },
      () => {
        this.getUserTransactionsHistoryPageData();
      }
    );
  };

  componentDidMount() {
    console.log(this.props.userSession);
    this.getUserTransactionsHistoryPageData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["email"];
    const nextPropsCompare = pick(nextProps.userSession, compareKeys);
    const propsCompare = pick(this.props.userSession, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;
    const {
      hoverPaper,
      loading,

      rowsPerPage,
      pageBase0,
      transactions,
      transactionsLength,
      rowsLengthChoices,

      names,
    } = this.state;

    return (
      <div className={classes.transactionsHistoryContainerDiv}>
        {isEmpty(transactions) && !loading && (
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
        {!isEmpty(transactions) && !loading && (
          <TableContainer className={classes.tableContainer}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {names.map((typeName, index) => {
                    return this.chooseTableCell(index, classes);
                  })}
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {transactions.map((row, index) => (
                  <TransactionsHistoryTableRow
                    key={index}
                    transactionInfo={row}
                    rowIndex={index}
                    rowsLength={transactions.length}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!isEmpty(transactions) && !loading && (
          <TablePagination
            classes={{
              selectIcon: classes.tablePaginationSelectIcon,
              actions: classes.tablePaginationActions,
            }}
            className={classes.tablePagination}
            rowsPerPageOptions={rowsLengthChoices}
            component="div"
            count={transactionsLength}
            rowsPerPage={rowsPerPage}
            page={pageBase0}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(TransactionsHistoryTableContainer))
);
