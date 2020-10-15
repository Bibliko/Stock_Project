import React from "react";
import { isEqual } from "lodash";
import { withRouter } from "react-router";
import clsx from "clsx";

import { numberWithCommas } from "../../../utils/low-dependency/NumberUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableBody,
  Typography,
} from "@material-ui/core";

import {
  ArrowDropUpRounded as ArrowDropUpRoundedIcon,
  ArrowDropDownRounded as ArrowDropDownRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  table: {
    width: "100%",
    border: "hidden",
  },
  tableContainer: {
    borderRadius: "4px",
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  tableCell: {
    color: "white",
    border: "hidden",
    borderRightWidth: "0px",
    // borderRightColor: "white",
    borderRightStyle: "solid",
  },
  tableCellCenter: {
    color: "white",
    border: "hidden",
    display: "flex",
    alignItems: "center",
  },
  arrowUp: {
    color: "#219653",
  },
  arrowDown: {
    color: "#ef0808",
  },
  summaryTableItem: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
});

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.tableRow.darkBlue,
    },
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.tableRow.lightBlue,
    },
  },
}))(TableRow);

class SummaryTableContainer extends React.Component {
  checkIfDailyChangeUpOrDown = (type) => {
    if (type === "Daily Change")
      return this.props.userDailyChange >= 0 ? "Up" : "Down";
  };

  chooseTableRowValue = (type) => {
    switch (type) {
      case "Cash":
        return `$${numberWithCommas(this.props.cash)}`;

      case "Shares":
        return `$${numberWithCommas(
          (this.props.totalPortfolio - this.props.cash).toFixed(2)
        )}`;

      case "Total Portfolio Value":
        return `$${numberWithCommas(this.props.totalPortfolio)}`;

      case "Daily Change":
        if (this.props.userDailyChange < 0) {
          return `-$${numberWithCommas(Math.abs(this.props.userDailyChange))}`;
        }
        return `$${numberWithCommas(this.props.userDailyChange)}`;

      case "Overall Rank":
        return `${numberWithCommas(this.props.ranking)}`;

      default:
        return;
    }
  };

  chooseTableRow = (type, classes) => {
    const dailyChangeTrend = this.checkIfDailyChangeUpOrDown(type);

    return (
      <StyledTableRow>
        <TableCell
          component="th"
          scope="row"
          align="left"
          className={classes.tableCell}
        >
          <Typography className={classes.summaryTableItem}>{type}</Typography>
        </TableCell>
        <TableCell
          align="left"
          className={clsx(classes.tableCellCenter, {
            [classes.arrowUp]: dailyChangeTrend === "Up",
            [classes.arrowDown]: dailyChangeTrend === "Down",
          })}
        >
          <Typography className={classes.summaryTableItem}>
            {this.chooseTableRowValue(type)}
          </Typography>
          {dailyChangeTrend === "Up" && (
            <ArrowDropUpRoundedIcon className={classes.arrowUp} />
          )}
          {dailyChangeTrend === "Down" && (
            <ArrowDropDownRoundedIcon className={classes.arrowDown} />
          )}
        </TableCell>
      </StyledTableRow>
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextProps, this.props);
  }

  render() {
    const { classes } = this.props;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableBody>
            {this.chooseTableRow("Cash", classes)}
            {this.chooseTableRow("Shares", classes)}
            {this.chooseTableRow("Total Portfolio Value", classes)}
            {this.chooseTableRow("Daily Change", classes)}
            {this.chooseTableRow("Overall Rank", classes)}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(withRouter(SummaryTableContainer));
