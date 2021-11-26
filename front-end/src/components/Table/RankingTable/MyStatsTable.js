import React from "react";
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
  TableHead,
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
    maxWidth: "650px",
    width: "80%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
    alignSelf: "center",
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
  },
  tableCell: {
    border: "hidden",
    color: "white",
  },
  head: {
    backgroundColor: theme.palette.paperBackground.sub,
  },
  headtitle: {
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    fontWeight: "bold",
  },
  content: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    letterSpacing: "0.03em",
  },
  arrowUp: {
    display: "flex",
    color: theme.palette.secondary.main,
  },
  arrowDown: {
    display: "flex",
    color: theme.palette.fail.main,
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

class MyStatsTable extends React.Component {
  getChangeTrend = (type) => {
    if (type === "Change from previous week")
      return this.props.changeFromPreviousWeek >= 0 ? "Up" : "Down";
  };

  getTableRowValue = (type) => {
    const {
      overallRank,
      regionRank,
      portfolioValue,
      changeFromPreviousWeek,
      portfolioHigh,
      portfolioLow,
    } = this.props;

    switch (type) {
      case "Overall ranking":
        return `${numberWithCommas(overallRank)}`;

      case "Region ranking":
        return `${numberWithCommas(regionRank)}`;

      case "Portfolio value":
        return `$${numberWithCommas(roundNumber(portfolioValue, 2))}`;

      case "Change from previous week":
        if (changeFromPreviousWeek < 0) {
          return `- $${numberWithCommas(roundNumber(Math.abs(changeFromPreviousWeek), 2))}`;
        }
        return `$${numberWithCommas(roundNumber(changeFromPreviousWeek, 2))}`;

      case "Portfolio high":
        return `$${numberWithCommas(roundNumber(portfolioHigh, 2))}`;

      case "Portfolio low":
        return `$${numberWithCommas(roundNumber(portfolioLow, 2))}`;

      default:
        return;
    }
  };

  getTableRow = (label) => {
    const { t, classes } = this.props;
    const changeTrend = this.getChangeTrend(label);

    return (
      <StyledTableRow key={"stat-" + label}>
        <TableCell
          align="left"
          className={clsx(classes.tableCell, classes.content)}
        >
          {t("table." + label) + ":"}
        </TableCell>

        <TableCell
          align="left"
          className={clsx(classes.tableCell, {
            [classes.arrowUp]: changeTrend === "Up",
            [classes.arrowDown]: changeTrend === "Down",
          })}
        >
          <Typography className={classes.content}>
            {this.getTableRowValue(label)}
          </Typography>
          {changeTrend === "Up" && (
            <ArrowDropUpRoundedIcon className={classes.arrowUp} />
          )}
          {changeTrend === "Down" && (
            <ArrowDropDownRoundedIcon className={classes.arrowDown} />
          )}
        </TableCell>
      </StyledTableRow>
    );
  };

  render() {
    const { t, classes } = this.props;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="my stats table">
          <TableHead>
            <TableRow className={classes.head}>
              <TableCell align="left" className={classes.tableCell}>
                <Typography className={classes.headtitle}>
                  {t("table.myStats")}
                </Typography>
              </TableCell>
              {<TableCell align="left" className={classes.tableCell} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.getTableRow("Overall ranking")}
            {this.getTableRow("Region ranking")}
            {this.getTableRow("Portfolio value")}
            {this.getTableRow("Change from previous week")}
            {this.getTableRow("Portfolio high")}
            {this.getTableRow("Portfolio low")}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withTranslation()(withStyles(styles)(MyStatsTable));
