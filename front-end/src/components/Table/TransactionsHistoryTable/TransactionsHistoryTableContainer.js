import React from "react";
import clsx from "clsx";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import TransactionsHistoryTableRow from "./TransactionsHistoryTableRow";
import TransactionsHistoryFilterDialog from "../../Dialog/TransactionsHistoryFilterDialog";
import {
  chooseTableCellHeader,
  paperWhenHistoryEmpty,
  tablePagination,
} from "./helperComponents";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import { getUserTransactionsHistory } from "../../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Fab,
  Container,
  Typography,
} from "@material-ui/core";

import { FilterList as FilterListIcon } from "@material-ui/icons";

const styles = (theme) => ({
  table: {
    width: "100%",
    borderCollapse: "separate",
  },
  tableContainer: {
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
  },
  tableCell: {
    minWidth: "100px",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    borderWidth: "1px",
    borderColor: theme.palette.paperBackground.sub,
    borderStyle: "solid",
  },
  tableCellTransactionTime: {
    minWidth: "200px",
  },
  cellDiv: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    display: "flex",
    alignItems: "center",
    "&.MuiTableSortLabel-root": {
      color: "white",
      "&.MuiTableSortLabel-active": {
        fontStyle: "italic",
        "&.MuiTableSortLabel-root": {
          "&.MuiTableSortLabel-active": {
            "& .MuiTableSortLabel-icon": {
              color: "white",
            },
          },
        },
      },
      "&:hover": {
        fontStyle: "italic",
      },
      "&:focus": {
        fontStyle: "italic",
      },
    },
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
      color: theme.palette.disabled.main,
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
  filterButton: {
    "&.MuiFab-extended": {
      "&.MuiFab-sizeMedium": {
        width: "110px",
      },
    },
    backgroundColor: theme.palette.primary.subDark,
    "&:hover": {
      backgroundColor: theme.palette.primary.subDarkHover,
    },
    color: "white",
    position: "fixed",
    zIndex: theme.customZIndex.floatingToolButton,
    transition: "width 0.2s",
    top: theme.customMargin.topFloatingToolButton,
    [theme.breakpoints.down("xs")]: {
      top: theme.customMargin.smallTopFloatingToolButton,
    },
  },
  filterButtonNotExtended: {
    "&.MuiFab-extended": {
      "&.MuiFab-sizeMedium": {
        width: "40px",
      },
    },
  },
  filterIconMargin: {
    marginRight: "5px",
  },
  filteringContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 0,
    marginBottom: 24,
  },
  filterWord: {
    width: "100%",
    opacity: 1,
    color: "white",
    fontSize: "medium",
    transition: "font-size 0.2s",
  },
  filterWordHidden: {
    fontSize: 0,
  },
  title: {
    marginBottom: "30px",
    fontSize: "x-large",
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
});

class TransactionsHistoryTableContainer extends React.Component {
  state = {
    hoverPaper: true,
    loading: true,
    openFilterDialog: false,
    isScrollingUp: true,
    isFirstInitializationEmpty: true,

    rowsLengthChoices: [1, 5, 10], // min to max
    rowsPerPage: 5,
    pageBase0: 0,
    filters: {
      type: "none", // buy, sell, OR none
      code: "none", // none OR random string with NO String ";"
      quantity: "none_to_none", // (int/none)_to_(int/none)
      price: "none_to_none", // (int/none)_to_(int/none)
      spendOrGain: "none_to_none", // (int/none)_to_(int/none)
      transactionTime: "none_to_none", // (DateTime/none)_to_(DateTime/none)
    },
    orderBy: "finishedTime",
    orderQuery: "desc",

    transactions: [],
    transactionsLength: 0,

    names: [
      "Type",
      "Code",
      "Quantity",
      "Price",
      "Gain/Loss",
      "Transaction Time",
    ],
    prismaNames: [
      "",
      "companyCode",
      "quantity",
      "priceAtTransaction",
      "spendOrGain",
      "finishedTime",
    ],
  };

  scrollPosition;

  timeoutToChangePage;

  timeoutStartAnimationAgain;

  hoverPaper = () => {
    this.setState({
      hoverPaper: true,
    });
  };
  notHoverPaper = () => {
    this.setState({
      hoverPaper: false,
    });

    this.timeoutStartAnimationAgain = setTimeout(() => {
      this.setState({
        hoverPaper: true,
      });
    }, 3 * oneSecond);
  };

  openFilterDialog = () => {
    this.setState({ openFilterDialog: true });
  };
  closeFilterDialog = () => {
    this.setState({ openFilterDialog: false });
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

  setStateTransactions = (redisTransactions, needScrollToTop) => {
    const { loading } = this.state;

    const { transactions, transactionsLength } = redisTransactions;

    this.setState(
      {
        transactions,
        transactionsLength,
        isFirstInitializationEmpty:
          transactionsLength === 0 && loading ? true : false,
        loading: false,
      },
      () => {
        if (needScrollToTop) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    );
  };

  getUserTransactionsHistoryPageData = (needScrollToTop) => {
    const { email } = this.props.userSession;
    const {
      rowsLengthChoices,
      pageBase0,
      rowsPerPage,
      filters,
      orderBy,
      orderQuery,
    } = this.state;

    getUserTransactionsHistory(
      email,
      rowsLengthChoices,
      pageBase0 + 1,
      rowsPerPage,
      filters,
      orderBy,
      orderQuery
    )
      .then((transactions) => {
        this.setStateTransactions(transactions, needScrollToTop);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleChangePage = (event, newPage) => {
    if (this.timeoutToChangePage) {
      clearTimeout(this.timeoutToChangePage);
    }

    this.setState({ pageBase0: newPage }, () => {
      this.timeoutToChangePage = setTimeout(
        () => this.getUserTransactionsHistoryPageData(false),
        oneSecond / 3
      );
    });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState(
      {
        rowsPerPage: parseInt(event.target.value, 10),
        pageBase0: 0,
      },
      () => {
        this.getUserTransactionsHistoryPageData(true);
      }
    );
  };

  handleChangeFilters = (newFilters) => {
    this.setState({
      filters: newFilters,
    });
  };

  handleDoneFilters = () => {
    this.setState(
      {
        pageBase0: 0,
      },
      () => {
        this.getUserTransactionsHistoryPageData();
      }
    );
  };

  handleScroll = (event) => {
    const window = event.currentTarget;
    const { isScrollingUp } = this.state;

    if (this.scrollPosition > window.scrollY + 4) {
      if (!isScrollingUp) {
        this.setState({
          isScrollingUp: true,
        });
      }
    } else if (this.scrollPosition + 4 < window.scrollY) {
      if (isScrollingUp) {
        this.setState({
          isScrollingUp: false,
        });
      }
    }

    this.scrollPosition = window.scrollY;
  };

  componentDidMount() {
    this.getUserTransactionsHistoryPageData();

    this.scrollPosition = window.scrollY;
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);

    clearTimeout(this.timeoutToChangePage);
    clearTimeout(this.timeoutStartAnimationAgain);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const userSessionKeys = ["email"];
    const compareKeys = [
      "classes",
      ...userSessionKeys.map((key) => "userSession." + key),
    ];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

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
      isFirstInitializationEmpty,
      openFilterDialog,
      isScrollingUp,

      transactions,
      transactionsLength,

      rowsLengthChoices,
      pageBase0,
      rowsPerPage,
      filters,

      names,
    } = this.state;

    return (
      <div className={classes.transactionsHistoryContainerDiv}>
        {isFirstInitializationEmpty &&
          !loading &&
          paperWhenHistoryEmpty(
            classes,
            hoverPaper,
            this.hoverPaper,
            this.notHoverPaper
          )}
        {!isFirstInitializationEmpty && !loading && (
          <React.Fragment>
            <Container className={classes.filteringContainer}>
              <Fab
                variant="extended"
                size="medium"
                className={clsx(classes.filterButton, {
                  [classes.filterButtonNotExtended]: !isScrollingUp,
                })}
                onClick={this.openFilterDialog}
              >
                <FilterListIcon
                  className={isScrollingUp ? classes.filterIconMargin : null}
                />
                <Typography
                  className={clsx(classes.filterWord, {
                    [classes.filterWordHidden]: !isScrollingUp,
                  })}
                >
                  Filter
                </Typography>
              </Fab>
              <TransactionsHistoryFilterDialog
                filters={filters}
                openFilterDialog={openFilterDialog}
                handleChangeFilters={this.handleChangeFilters}
                handleDoneFilters={this.handleDoneFilters}
                handleClose={this.closeFilterDialog}
              />
            </Container>
            <Typography className={classes.title}>Trading History</Typography>
            <TableContainer className={classes.tableContainer}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {names.map((typeName, index) => {
                      return chooseTableCellHeader(
                        index,
                        this.createSortHandler,
                        classes,
                        this.state
                      );
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
            {tablePagination(
              rowsLengthChoices,
              transactionsLength,
              rowsPerPage,
              pageBase0,
              this.handleChangePage,
              this.handleChangeRowsPerPage,
              classes
            )}
          </React.Fragment>
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
