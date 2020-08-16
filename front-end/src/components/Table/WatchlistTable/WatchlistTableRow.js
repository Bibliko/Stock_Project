import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";
import { isEqual, pick } from "lodash";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { numberWithCommas, shortenNumber } from "../../../utils/NumberUtil";
import { getFullStockQuote } from "../../../utils/FinancialModelingPrepUtil";
import { oneSecond } from "../../../utils/DayTimeUtil";
import { changeUserData } from "../../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";

import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import DeleteForeverRoundedIcon from "@material-ui/icons/DeleteForeverRounded";

const styles = (theme) => ({
  tableCell: {
    color: "white",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderColor: "#2D9CDB",
    borderStyle: "solid",
    backgroundColor: theme.palette.paperBackground.deepBlueTable,
  },
  tableRow: {
    background: "transparent",
    backgroundColor: "transparent",
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cellDivName: {
    justifyContent: "flex-start",
  },
  watchlistButton: {
    color: "#619FD7",
    "&:hover": {
      color: "rgba(97, 159, 215, 0.8)",
    },
    padding: "5px",
  },
  watchlistIcon: {
    height: "30px",
    width: "30px",
  },
  arrowUp: {
    color: "#219653",
  },
  arrowDown: {
    color: "#ef0808",
  },
  marginLeftIfProfitOrLoss: {
    marginLeft: "12px",
  },
  iconInsideIconButton: {
    height: "22px",
    width: "22px",
    color: "white",
    "&:hover": {
      color: "#e23d3d",
      cursor: "pointer",
    },
  },
  stickyCell: {
    position: "sticky",
    left: 0,
  },
  watchlistRowItem: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },

  // border section
  lastLeftCell: {
    borderBottomLeftRadius: "4px",
  },
  lastRightCell: {
    borderBottomRightRadius: "4px",
  },
  lastRow: {
    borderBottomWidth: "1px",
  },
});

class WatchlistTableRow extends React.Component {
  state = {
    name: this.props.companyCode,
    price: 0,
    volume: 0,
    changesPercentage: 0,
    marketCap: 0,
  };

  intervalForUpdateShareInfo;

  checkIfChangeIncreaseOrDecrease = (type) => {
    if (type === "Change %" && this.state.changesPercentage >= 0) {
      return "Increase";
    }
    if (type === "Change %" && this.state.changesPercentage < 0) {
      return "Decrease";
    }
  };

  chooseTableCell = (type, classes) => {
    return (
      <TableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.arrowUp]:
            this.checkIfChangeIncreaseOrDecrease(type) === "Increase",
          [classes.arrowDown]:
            this.checkIfChangeIncreaseOrDecrease(type) === "Decrease",
          [classes.lastLeftCell]: this.isTableRowTheLast() && type === "Name",
          [classes.lastRow]: this.isTableRowTheLast(),
          [classes.stickyCell]: type === "Code",
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.marginLeftIfProfitOrLoss]: type === "Change %",
            [classes.cellDivName]: type === "Name",
          })}
        >
          <Typography className={classes.watchlistRowItem} noWrap>
            {this.chooseTableCellValue(type)}
          </Typography>
          {this.checkIfChangeIncreaseOrDecrease(type) === "Increase" && (
            <ArrowDropUpRoundedIcon className={classes.arrowUp} />
          )}
          {this.checkIfChangeIncreaseOrDecrease(type) === "Decrease" && (
            <ArrowDropDownRoundedIcon className={classes.arrowDown} />
          )}
        </div>
      </TableCell>
    );
  };

  chooseTableCellValue = (type) => {
    const { companyCode } = this.props;

    switch (type) {
      case "Name":
        return `${this.state.name}`;

      case "Code":
        return `${companyCode}`;

      case "Price":
        return `$${numberWithCommas(this.state.price.toFixed(2))}`;

      case "Volume":
        return `${shortenNumber(this.state.volume.toFixed(2))}`;

      case "Change %":
        if (this.state.changesPercentage < 0) {
          return `-${numberWithCommas(
            Math.abs(this.state.changesPercentage).toFixed(2)
          )}%`;
        }
        return `${numberWithCommas(this.state.changesPercentage.toFixed(2))}%`;

      case "Market Cap":
        return `${shortenNumber(this.state.marketCap)}`;

      default:
        return;
    }
  };

  isTableRowTheLast = () => {
    const { rowIndex, rowsLength } = this.props;
    return rowIndex === rowsLength - 1;
  };

  removeFromWatchlist = () => {
    const { companyCode } = this.props;
    const { watchlist, email } = this.props.userSession;

    let newWatchlist = [];
    watchlist.map((companyCodeString) => {
      if (!isEqual(companyCodeString, companyCode)) {
        newWatchlist.push(companyCodeString);
      }
      return "dummy value";
    });

    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser)
      .then((res) => {
        this.props.openSnackbar(companyCode);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  setStateStockQuote = (stockQuoteJSON) => {
    const neededAttribute = [
      "name",
      "price",
      "volume",
      "changesPercentage",
      "marketCap",
    ];
    const necessaryInfo = pick(stockQuoteJSON, neededAttribute);
    const infoFromState = pick(this.state, neededAttribute);
    if (!isEqual(infoFromState, necessaryInfo)) {
      this.setState({
        ...this.state,
        ...necessaryInfo,
      });
    }
  };

  setStateShareInfo = () => {
    // const { companyCode } = this.props;
    // getFullStockQuote(companyCode)
    //   .then((stockQuoteJSON) => {
    //     console.log(stockQuoteJSON);
    //     this.setStateStockQuote(stockQuoteJSON);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  setupAndUpdateWatchlistComponent = () => {
    const { isMarketClosed } = this.props;

    this.setStateShareInfo();

    if (!isMarketClosed) {
      if (!this.intervalForUpdateShareInfo) {
        this.intervalForUpdateShareInfo = setInterval(
          this.setStateShareInfo,
          30 * oneSecond
        );
      }
    } else {
      clearInterval(this.intervalForUpdateShareInfo);
    }
  };

  componentDidMount() {
    this.setupAndUpdateWatchlistComponent();
  }

  componentWillUnmount() {
    clearInterval(this.intervalForUpdateShareInfo);
  }

  render() {
    const { classes } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        {this.chooseTableCell("Name", classes)}
        {this.chooseTableCell("Code", classes)}
        {this.chooseTableCell("Price", classes)}
        {this.chooseTableCell("Volume", classes)}
        {this.chooseTableCell("Change %", classes)}
        {this.chooseTableCell("Market Cap", classes)}

        <TableCell
          align="center"
          className={clsx(classes.tableCell, {
            [classes.lastRow]: this.isTableRowTheLast(),
            [classes.lastRightCell]: this.isTableRowTheLast(),
          })}
        >
          <div className={classes.cellDiv}>
            <DeleteForeverRoundedIcon
              className={classes.iconInsideIconButton}
              onClick={this.removeFromWatchlist}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = (state) => ({
  isMarketClosed: state.isMarketClosed,
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(WatchlistTableRow)));
