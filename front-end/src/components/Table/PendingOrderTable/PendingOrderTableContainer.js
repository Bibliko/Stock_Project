import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { orderAction } from "../../../redux/storeActions/actions";

import { withTranslation } from "react-i18next";

import {
  TableRow,
  TableContainer,
  Table,
  TableHead,
  TableBody,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import { getUserPendingTransactions } from "../../../utils/UserUtil";
import { deleteOrder } from "../../../utils/TransactionUtil";
import { redirectToPage } from "../../../utils/low-dependency/PageRedirectUtil";

import { paperWhenPendingOrderEmpty, chooseTableCellHeader } from "./helperComponents";
import PendingOrderTableRow from "./PendingOrderTableRow";

const styles = (theme) => ({
  pendingOrderContainerDiv: {
    width: "100%",
    marginTop: "24px",
  },
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
});

class PendingOrderTableContainer extends React.Component {
  state = {
    hoverPaper: true,
    loading: true,
    isFirstInitializationEmpty: true,
    pendingOrders: [],
    labels: [
      "Type",
      "Code",
      "Quantity",
      "Option",
      "Land price",
      "Brokerage",
      "Trade value",
      "Actions",
    ],
  };

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

  handleAmendOrder = (order) => {
    this.props.mutateOrder({
      ...order,
      amend: true,
    });
    redirectToPage("/placeOrder", this.props);
  };

  handleDeleteOrder = (orderID) => {
    deleteOrder(orderID)
      .then(() => {
        return this.getUserPendingTransactionsData();
      })
      .catch((err) => console.log(err));
  };

  getUserPendingTransactionsData = () => {
    const { email } = this.props.userSession;

    getUserPendingTransactions(email)
    .then(pendingOrders => {
      this.setState({
        loading: false,
        isFirstInitializationEmpty: !pendingOrders.length,
        pendingOrders,
      })
    })
    .catch((err) => {
      console.log(err);
    });
  };

  componentDidMount() {
    this.getUserPendingTransactionsData()
  }

  render() {
    const { t, classes } = this.props;
    const {
      hoverPaper,
      loading,
      isFirstInitializationEmpty,
      pendingOrders,
      labels,
    } = this.state;

    return (
      <div className={classes.pendingOrderContainerDiv}>
        {isFirstInitializationEmpty &&
          !loading &&
          paperWhenPendingOrderEmpty(
            t,
            classes,
            hoverPaper,
            this.hoverPaper,
            this.notHoverPaper
          )
        }
        {!isFirstInitializationEmpty && !loading && (
          <TableContainer className={classes.tableContainer}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {labels.map((_, index) => {
                    return chooseTableCellHeader(
                      t,
                      index,
                      this.state
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {pendingOrders.map((row, index) => (
                  <PendingOrderTableRow
                    key={index}
                    labels={labels}
                    order={row}
                    rowIndex={index}
                    rowsLength={pendingOrders.length}
                    handleDelete={() => this.handleDeleteOrder(row.id)}
                    handleAmend={() => this.handleAmendOrder(row)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateOrder: (dataToChange) => dispatch(orderAction("change", dataToChange)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withTranslation()(
    withStyles(styles)(withRouter(PendingOrderTableContainer))
  )
);
