import React from "react";
import { isEqual } from "lodash";
import { withRouter } from "react-router";
import clsx from "clsx";

import { withTranslation } from "react-i18next";

import {
  numberWithCommas,
  roundNumber,
} from "../../../utils/low-dependency/NumberUtil";

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
    boxShadow: theme.customShadow.tableContainer,
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
    color: theme.palette.secondary.main,
  },
  arrowDown: {
    color: theme.palette.fail.main,
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
      backgroundColor: theme.palette.paperBackground.onPage,
    },
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.paperBackground.onPageLight,
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
          roundNumber(this.props.totalPortfolio - this.props.cash, 2)
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
          <Typography className={classes.summaryTableItem}>
            {this.props.t("table." + type)}
          </Typography>
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

export default withTranslation()(
  withStyles(styles)(withRouter(SummaryTableContainer))
);
