import React from "react";
import { withRouter } from "react-router";
import axios from 'axios'
//import _ from 'lodash'

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
  state= {userRanking: []};

  componentDidMount () {
   axios('/api/userData/getOverallRanking', {
      method: "get",
      params: {
        page: 1

      },

    }).then(result=>this.setState({userRanking: result.data})).catch(error=>console.log(error))
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
    console.log(this.state.userRanking)

    if(type==="1"){
      const array1=this.state.userRanking[0]

      if(array1){

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
          >{array1.firstName}</TableCell>
          <TableCell
            component="th"
            scope="row"
            align="center"
            className={classes.tableCell}
          >{array1.totalPortfolio}</TableCell>
          <TableCell
            component="th"
            scope="row"
            align="center"
            className={classes.tableCell}
          >{array1.region}</TableCell>
        </StyledTableRow>
      );
    } else {
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
        >No user exist</TableCell>
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

  )
    }
  }

    if(type==="2"){
      const array2=this.state.userRanking[1]

      if(array2){
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
            >{array2.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array2.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array2.region}</TableCell>
          </StyledTableRow>
        );
      } else{
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
            >No user exist</TableCell>
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
      }


    }

    if(type==="3"){
      const array3=this.state.userRanking[2]

      if(array3){
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
            >{array3.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array3.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array3.region}</TableCell>
          </StyledTableRow>
        );
      } else {
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
            >No user exist</TableCell>
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
      }


    }

    if(type==="4"){
      const array4=this.state.userRanking[3]

      if(array4){
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
            >{array4.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array4.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array4.region}</TableCell>
          </StyledTableRow>
        );
      } else{
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
            >No user exist</TableCell>
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
      }


    }

    if(type==="5"){

      const array5=this.state.userRanking[4]

      if(array5){
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
            >{array5.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array5.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array5.region}</TableCell>
          </StyledTableRow>
        );
      } else{
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
            >No user exists</TableCell>
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
      }


    }

    if(type==="6"){
      const array6=this.state.userRanking[5]

      if(array6){
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
            >{array6.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array6.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array6.region}</TableCell>
          </StyledTableRow>
        );
      } else{
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
            >No user exists</TableCell>
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
      }


    }

    if(type==="7"){
      const array7=this.state.userRanking[6]

      if(array7){
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
            >{array7.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array7.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array7.region}</TableCell>
          </StyledTableRow>
        );
      } else{
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
            >No user exists</TableCell>
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
      }


    }

    if(type==="8"){
      const array8=this.state.userRanking[7]

      if(array8){
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
            >{array8.firstName}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array8.totalPortfolio}</TableCell>
            <TableCell
              component="th"
              scope="row"
              align="center"
              className={classes.tableCell}
            >{array8.region}</TableCell>
          </StyledTableRow>
        );
      } else{
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
            >No user exists</TableCell>
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
      }
      }





  };

  render() {
     console.log(this.state.userRanking)
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
