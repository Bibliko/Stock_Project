import React from "react";
import { withRouter } from "react-router";
import {connect} from 'react-redux'
import compose from 'recompose/compose'
import {fetchUserOverallRanking} from '../../../redux/storeActions/actions'

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
    color: "white",
    borderColor: "#DC3D4A",
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
    backgroundColor: "#EB5757",
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
      backgroundColor: "#FFA9A9",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#FE8383",
    },
  },
}))(TableRow);

class OverallTable extends React.Component {
    componentDidMount(){
    this.props.fetchUserOverallRanking()
    console.log(this.props.ranking)
  }
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

const mapStateToProps= state=>{
  return {
    ranking: state.overallRanking
  }
}


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {fetchUserOverallRanking} )
)(withRouter(OverallTable));
