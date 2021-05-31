import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";
import { connect } from "react-redux";
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
import { withStyles } from "@material-ui/core/styles";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import { getUserPendingTransactions } from "../../../utils/UserUtil";

import {
  paperWhenHistoryEmpty,
  chooseTableCellHeader,
} from "./helperComponents";
import PendingOrderTableRow from "./PendingOrderTableRow"


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
  firstElementTopLeftRounded: {
    borderTopLeftRadius: "4px",
  },
  lastElementTopRightRounded: {
    borderTopRightRadius: "4px",
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
})

class PendingOrderTableContainer extends React.Component {
  state = {
    hoverPaper: true,
    loading: true,
    openFilterDialog: false,
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
  }

  timeoutStartAnimationAgain;

  hoverPaper = () => {
    this.setState({
      hoverPaper: true,
    });
  }

  notHoverPaper = () => {
    this.setState({
      hoverPaper: false,
    });

    this.timeoutStartAnimationAgain = setTimeout(() => {
      this.setState({
        hoverPaper: true,
      });
    }, 3 * oneSecond);
  }

  componentDidMount() {
    this.getUserPendingTransactionsData()
  }

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
  }

  render() {
    const { classes } = this.props;
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
          paperWhenHistoryEmpty(
            classes,
            hoverPaper,
            this.hoverPaper,
            this.notHoverPaper
          )}
        {!isFirstInitializationEmpty && !loading && (
          <React.Fragment>
            <TableContainer>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {labels.map((_, index) => {
                      return chooseTableCellHeader(
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
                      order={row}
                      rowIndex={index}
                      rowsLength={pendingOrders.length}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
  withStyles(styles)(withRouter(PendingOrderTableContainer))
);