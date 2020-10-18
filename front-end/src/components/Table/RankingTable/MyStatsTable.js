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
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  tableCell: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    border: "hidden",
    color: "white",
  },
  head: {
    backgroundColor: "#5893C9",
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
      backgroundColor: "#78CBFA",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#63B5E3",
    },
  },
}))(TableRow);

class MyStatsTable extends React.Component {

  chooseTableRowValue = (type) => {
    switch (type) {
      case "Overall ranking":
        return ``;

      case "Region ranking":
        return ``;

      case "Portfolio value":
        return ``;

      case "Change from previous week":
        return ``;

      case "Portfolio high":
        //return `${this.props.portfolioHigh}`;
        return ``;

      default:
        return;
    }
  };

  chooseTableRow = (type, classes) => {
    return (
      <StyledTableRow>
        <TableCell align="left" className={classes.tableCell}>
          {type}
        </TableCell>
        <TableCell align="left" className={classes.tableCell}>
          {this.chooseTableRowValue(type)}
        </TableCell>
      </StyledTableRow>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow className={classes.head}>
              <TableCell align="left" className={classes.tableCell}>
                <Typography className={classes.headtitle}>
                  Performance Summary
                </Typography>
              </TableCell>
              <TableCell align="left" className={classes.tableCell} />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.chooseTableRow("Overall ranking:", classes)}
            {this.chooseTableRow("Region ranking:", classes)}
            {this.chooseTableRow("Portfolio value:", classes)}
            {this.chooseTableRow("Change from previous week:", classes)}
            {this.chooseTableRow("Portfolio high:", classes)}
            {this.chooseTableRow("Portfolio low:", classes)}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(withRouter(MyStatsTable));
