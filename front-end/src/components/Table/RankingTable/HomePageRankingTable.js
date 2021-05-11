import React from "react";
import { withStyles } from "@material-ui/core/styles";

import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@material-ui/core";


const styles = (theme) => ({
  container: {
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
  },
  table: {
    minWidth: "180px",
    width: "100%",
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.paperBackground.sub,
    fontWeight: "bold",
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
  body: {
    backgroundColor: theme.palette.paperBackground.onPage,
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
}))(TableCell);

class HomePageRankingTable extends React.Component {
  render() {
    const { classes, users } = this.props;

    return (
      <TableContainer className={classes.container} component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell style={{maxWidth: "50px" }} align="center"> Rank </StyledTableCell>
              <StyledTableCell align="left"> Name </StyledTableCell>
              <StyledTableCell align="right"> Net Worth </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, id) => {
              const fullName = user.firstName + " " + user.lastName;
              return (
                <TableRow key={fullName + id}>
                  <StyledTableCell align="center"> {id + 4} </StyledTableCell>
                  <StyledTableCell align="left"> {fullName} </StyledTableCell>
                  <StyledTableCell align="right"> {`$${user.totalPortfolio}`} </StyledTableCell>
                </TableRow>
            )})}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles)(HomePageRankingTable);