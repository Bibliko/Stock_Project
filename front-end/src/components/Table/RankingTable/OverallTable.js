import React from "react";
import { withRouter } from "react-router";

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

const styles = (theme) => ({
  table: {
    width: "100%",
    border: "hidden",
  },
  tableContainer: {
    width: "80%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
    alignSelf: "center",
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
  },
  tableCell: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    color: "white",
    borderColor: theme.palette.secondary.main,
    borderWidth: "2px",
    borderStyle: "solid",
    borderBottom: "hidden",
    borderTop: "hidden",
  },
  tableCellCenter: {
    border: "none",
    alignItems: "center",
  },
  headColor: {
    backgroundColor: theme.palette.paperBackground.sub,
  },
  headtitle: {
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    fontWeight: "bold",
    color: "white",
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

class OverallTable extends React.Component {
  chooseTableRowValue = (type) => {
    switch (type) {
      case "":
        return ``;

      default:
        return;
    }
  };

  chooseTableRow = (type, classes) => {
    return (
      <StyledTableRow>
        <TableCell
          component="th"
          scope="row"
          align="center"
          className={classes.tableCell}
        >
          {type}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          align="center"
          className={classes.tableCell}
        ></TableCell>
        <TableCell
          component="th"
          scope="row"
          align="center"
          className={classes.tableCell}
        ></TableCell>
        <TableCell
          component="th"
          scope="row"
          align="center"
          className={classes.tableCell}
        ></TableCell>
      </StyledTableRow>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow className={classes.headColor}>
              <TableCell
                component="th"
                scope="row"
                align="center"
                className={classes.tableCellCenter}
              >
                <Typography className={classes.headtitle}>#</Typography>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                className={classes.tableCellCenter}
              >
                <Typography className={classes.headtitle}>Username</Typography>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                className={classes.tableCellCenter}
              >
                <Typography className={classes.headtitle}>Portfolio</Typography>
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                className={classes.tableCellCenter}
              >
                <Typography className={classes.headtitle}>Region</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.chooseTableRow("1", classes)}
            {this.chooseTableRow("2", classes)}
            {this.chooseTableRow("3", classes)}
            {this.chooseTableRow("4", classes)}
            {this.chooseTableRow("5", classes)}
            {this.chooseTableRow("6", classes)}
            {this.chooseTableRow("7", classes)}
            {this.chooseTableRow("8", classes)}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(withRouter(OverallTable));
