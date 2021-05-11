import React from "react";
import { withStyles } from "@material-ui/core/styles";

import { numberWithCommas } from "../../../utils/low-dependency/NumberUtil.js";

import {
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  Typography,
} from "@material-ui/core";

const styles = (theme) => ({
  table: {
    width: "100%",
    border: "hidden",
  },
  tableContainer: {
    padding: "12px 0px",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      padding: "7px 0px",
    },
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  tableCell: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    color: "white",
    borderBottom: "0px",
    borderRight: "2px solid " + theme.palette.secondary.main,
  },
  headCell: {
    borderBottom: "0px",
    borderRight: "2px solid " + theme.palette.secondary.main,
    alignItems: "center",
  },
  headtitle: {
    fontSize: "20px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    fontWeight: "bold",
    color: theme.palette.secondary.main,
  },
});

class OverallTable extends React.Component {
  getTableRow = (user, id) => {
    const { classes } = this.props;
    const fullName = user.firstName + " " + user.lastName;
    const data = [
      id,
      fullName,
      `$${numberWithCommas(user.totalPortfolio)}`,
      user.region === "null" ? "-" : user.region,
    ];

    return (
      <TableRow key={fullName + id}>
        {
          data.map((datum, id) => (
            <TableCell
              key={fullName + id + "-" + id}
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >
              {datum}
            </TableCell>
          ))
        }
      </TableRow>
    );
  };

  render() {
    const { classes } = this.props;
    const users = this.props.users || [];
    const headLabels = [
      "#",
      "Username",
      "Portfolio",
      "Region",
    ];

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="ranking table">
          <TableHead>
            <TableRow>
              { headLabels.map((label) => (
                  <TableCell
                    key={"head-" + label}
                    component="th"
                    scope="row"
                    align="center"
                    className={classes.headCell}
                  >
                    <Typography className={classes.headtitle}> {label} </Typography>
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            { users.map((user, id) => (
                this.getTableRow(user, id + 1)
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}

export default withStyles(styles)(OverallTable);
