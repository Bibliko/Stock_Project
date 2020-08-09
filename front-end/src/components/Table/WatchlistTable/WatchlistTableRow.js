import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { numberWithCommas } from "../../../utils/NumberUtil";
import { getFullStockQuoteFromFMP } from "../../../utils/FinancialModelingPrepUtil";

import { withStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

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
    name: "",
    price: 0,
    volume: 0,
    changesPercentage: 0,
    marketCap: 0,
  };

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
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.marginLeftIfProfitOrLoss]: type === "Change %",
            [classes.cellDivName]: type === "Name",
          })}
        >
          {this.chooseTableCellValue(type)}
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
        return `$${numberWithCommas(this.state.volume.toFixed(2))}`;

      case "Change %":
        if (this.state.changesPercentage < 0) {
          return `-$${numberWithCommas(
            Math.abs(this.state.changesPercentage).toFixed(2)
          )}`;
        }
        return `$${numberWithCommas(this.state.changesPercentage.toFixed(2))}`;

      case "Market Cap":
        return `${this.state.marketCap}`;

      default:
        return;
    }
  };

  isTableRowTheLast = () => {
    const { rowIndex, rowsLength } = this.props;
    return rowIndex === rowsLength - 1;
  };

  updateWatchlistRowInformation = () => {
    // const { companyCode } = this.props;
    // getFullStockQuoteFromFMP(companyCode)
    //   .then((stockQuoteJSON) => {
    //     const {
    //       name,
    //       price,
    //       volume,
    //       changesPercentage,
    //       marketCap,
    //     } = stockQuoteJSON;
    //     this.setState({
    //       name: name,
    //       price: price,
    //       volume: volume,
    //       changesPercentage: changesPercentage,
    //       marketCap: marketCap,
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  componentDidMount() {}

  componentWillUnmount() {}

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
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = (state) => ({
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(WatchlistTableRow)));
