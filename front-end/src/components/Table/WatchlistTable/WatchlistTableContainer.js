import React from "react";
import clsx from "clsx";
import { isEqual, isEmpty } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";

import WatchlistTableRow from "./WatchlistTableRow";

import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Snackbar,
  Typography,
  Paper,
} from "@material-ui/core";

import { BusinessRounded as BusinessRoundedIcon } from "@material-ui/icons";

import { Alert as MuiAlert } from "@material-ui/lab";

const styles = (theme) => ({
  table: {
    width: "100%",
    borderCollapse: "separate",
  },
  tableContainer: {
    borderRadius: "4px",
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  tableCell: {
    minWidth: "100px",
    fontSize: "12px",
    borderWidth: "1px",
    borderColor: theme.palette.tableHeader.darkBlue,
    borderStyle: "solid",
  },
  tableCellName: {
    minWidth: "150px",
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cellDivName: {
    justifyContent: "flex-start",
  },
  emptyRowsPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: theme.customHeight.redirectingPaper,
    color: "white",
    padding: 20,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  companiesIcon: {
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
  companiesIconAnimation: {
    animation: "2s infinite $bounceIcon",
    animationTimingFunction: "cubic-bezier(0.280, 0.840, 0.420, 1)",
  },
  companiesWord: {
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    textAlign: "center",
  },
  watchlistContainerDiv: {
    width: "100%",
    marginTop: "24px",
  },
  stickyCell: {
    position: "sticky",
    left: 0,
    borderTopLeftRadius: "4px",
  },
  lastElementTopRightRounded: {
    borderTopRightRadius: "4px",
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.tableHeader.darkBlue,
    color: "white",
  },
}))(TableCell);

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class WatchlistTableContainer extends React.Component {
  state = {
    openSnackbar: false,
    companyCodeRemoved: "",

    hoverWatchlistPaper: false,
  };

  hoverPaper = () => {
    this.setState({
      hoverWatchlistPaper: true,
    });
  };

  notHoverPaper = () => {
    this.setState({
      hoverWatchlistPaper: false,
    });
  };

  handleOpenSnackbar = (companyCode) => {
    this.setState({
      openSnackbar: true,
      companyCodeRemoved: companyCode,
    });
  };

  handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({
      openSnackbar: false,
    });
  };

  chooseTableCell = (type, classes) => {
    return (
      <StyledTableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.tableCellName]: type === "Name",
          [classes.stickyCell]: type === "Code",
          [classes.lastElementTopRightRounded]: type === " ",
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.cellDivName]: type === "Name",
          })}
        >
          {type}
        </div>
      </StyledTableCell>
    );
  };

  render() {
    const { classes, rows } = this.props;
    const {
      openSnackbar,
      companyCodeRemoved,
      hoverWatchlistPaper,
    } = this.state;

    return (
      <div className={classes.watchlistContainerDiv}>
        {isEmpty(rows) && (
          <Paper
            className={classes.emptyRowsPaper}
            elevation={2}
            onMouseEnter={this.hoverPaper}
            onMouseLeave={this.notHoverPaper}
          >
            <BusinessRoundedIcon
              className={clsx(classes.companiesIcon, {
                [classes.companiesIconAnimation]: hoverWatchlistPaper,
              })}
            />
            <Typography className={classes.companiesWord}>
              Start by adding more companies to your list!
            </Typography>
          </Paper>
        )}
        {!isEmpty(rows) && (
          <TableContainer className={classes.tableContainer}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {this.chooseTableCell("Code", classes)}
                  {this.chooseTableCell("Name", classes)}
                  {this.chooseTableCell("Price", classes)}
                  {this.chooseTableCell("Volume", classes)}
                  {this.chooseTableCell("Change %", classes)}
                  {this.chooseTableCell("Market Cap", classes)}
                  {this.chooseTableCell(" ", classes)}
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {rows.map(
                  (row, index) =>
                    !isEqual(row, companyCodeRemoved) && (
                      <WatchlistTableRow
                        key={index}
                        companyCode={row}
                        rowIndex={index}
                        rowsLength={rows.length}
                        openSnackbar={this.handleOpenSnackbar}
                      />
                    )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6 * oneSecond}
          onClose={this.handleCloseSnackbar}
        >
          <Alert onClose={this.handleCloseSnackbar} severity="success">
            {`Removed ${companyCodeRemoved} from watchlist successfully!`}
          </Alert>
        </Snackbar>
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(WatchlistTableContainer));
