import React from "react";
import { isEqual, pick } from "lodash";
import clsx from "clsx";
import { withRouter } from "react-router";
import { socket } from "../../../App";

import { connect } from "react-redux";
import { userAction } from "../../../redux/storeActions/actions";

import { getFullStockInfo } from "../../../utils/RedisUtil";
import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import {
  numberWithCommas,
  roundNumber,
} from "../../../utils/low-dependency/NumberUtil";
import { changeUserData } from "../../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Tooltip,
} from "@material-ui/core";

import {
  AddBoxRounded as AddBoxRoundedIcon,
  ArrowDropUpRounded as ArrowDropUpRoundedIcon,
  ArrowDropDownRounded as ArrowDropDownRoundedIcon,
  DeleteForeverRounded as DeleteForeverRoundedIcon,
  InfoRounded as InfoRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  tableCell: {
    color: "white",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderColor: theme.palette.secondary.main,
    borderStyle: "solid",
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  cellDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addWatchlistButton: {
    color: theme.palette.secondary.main,
    "&:hover": {
      color: theme.palette.secondary.mainHover,
    },
  },
  removeWatchlistButton: {
    color: theme.palette.fail.main,
    "&:hover": {
      color: theme.palette.fail.mainHover,
    },
  },
  watchlistIcon: {
    height: "22px",
    width: "22px",
  },
  arrowUp: {
    color: theme.palette.secondary.main,
  },
  arrowDown: {
    color: theme.palette.fail.main,
  },
  marginLeftIfProfitOrLoss: {
    marginLeft: "12px",
  },
  stickyCell: {
    position: "sticky",
    left: 0,
  },
  holdingsTableItem: {
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
  codeInfoButton: {
    color: "white",
    padding: 0,
    marginLeft: "8px",
  },
});

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    boxShadow: theme.customShadow.popup,
    color: "white",
    maxWidth: 220,
  },
  arrow: {
    color: theme.palette.paperBackground.onPageSuperLight,
  },
}))(Tooltip);

class HoldingsTableRow extends React.Component {
  state = {
    lastPrice: "Updating",
    profitOrLoss: "Updating",
    isInWatchlist: false,
    openInfo: false,
  };

  checkStockPriceInterval;

  checkIfProfitOrLoss = (type) => {
    if (type === "Profit/Loss" && this.state.profitOrLoss >= 0) {
      return "Profit";
    }
    if (type === "Profit/Loss" && this.state.profitOrLoss < 0) {
      return "Loss";
    }
  };

  chooseTableCellValue = (type) => {
    const { rowData } = this.props;

    switch (type) {
      case "Code":
        return `${rowData.code}`;

      case "Holding":
        return `${numberWithCommas(rowData.holding)}`;

      case "Buy Price (Avg)":
        return `$${numberWithCommas(roundNumber(rowData.buyPriceAvg, 2))}`;

      case "Last Price":
        return `$${numberWithCommas(this.state.lastPrice)}`;

      case "Profit/Loss":
        if ((this.state.profitOrLoss, 10 < 0)) {
          return `-$${numberWithCommas(Math.abs(this.state.profitOrLoss))}`;
        }
        return `$${numberWithCommas(this.state.profitOrLoss)}`;

      default:
        return;
    }
  };

  isTableRowTheLast = () => {
    const { rowIndex, rowsLength } = this.props;
    return rowIndex === rowsLength - 1;
  };

  chooseTableCell = (type, classes) => {
    return (
      <TableCell
        align="center"
        className={clsx(classes.tableCell, {
          [classes.arrowUp]: this.checkIfProfitOrLoss(type) === "Profit",
          [classes.arrowDown]: this.checkIfProfitOrLoss(type) === "Loss",
          [classes.lastLeftCell]: this.isTableRowTheLast() && type === "Code",
          [classes.lastRow]: this.isTableRowTheLast(),
          [classes.stickyCell]: type === "Code" && !this.props.minimal,
        })}
      >
        <div
          className={clsx(classes.cellDiv, {
            [classes.marginLeftIfProfitOrLoss]:
              type === "Profit/Loss" && this.state.profitOrLoss !== "Updating",
          })}
        >
          <Typography className={classes.holdingsTableItem}>
            {this.chooseTableCellValue(type)}
          </Typography>
          {type === "Code" && (
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Typography color="inherit">Logo</Typography>
                  <Typography color="inherit">Name</Typography>
                </React.Fragment>
              }
              arrow
              open={this.state.openInfo}
            >
              <IconButton
                className={classes.codeInfoButton}
                onClick={this.switchInfoTooltip}
                onMouseEnter={this.openInfoTooltip}
                onMouseLeave={this.closeInfoTooltip}
              >
                <InfoRoundedIcon onBlur={this.closeInfoTooltip} />
              </IconButton>
            </HtmlTooltip>
          )}
          {this.checkIfProfitOrLoss(type) === "Profit" && (
            <ArrowDropUpRoundedIcon className={classes.arrowUp} />
          )}
          {this.checkIfProfitOrLoss(type) === "Loss" && (
            <ArrowDropDownRoundedIcon className={classes.arrowDown} />
          )}
        </div>
      </TableCell>
    );
  };

  switchInfoTooltip = () => {
    this.setState({
      openInfo: !this.state.openInfo,
    });
  };

  openInfoTooltip = () => {
    this.setState({
      openInfo: true,
    });
  };

  closeInfoTooltip = () => {
    this.setState({
      openInfo: false,
    });
  };

  addToWatchlist = () => {
    const { code } = this.props.rowData;
    const { email, watchlist } = this.props.userSession;
    let newWatchlist = watchlist;

    newWatchlist.push(code);
    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser, socket)
      .then(() => {
        this.setState({
          isInWatchlist: true,
        });
        this.props.openSnackbar(code, "Added");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  removeFromWatchlist = () => {
    const { code } = this.props.rowData;
    const { email, watchlist } = this.props.userSession;
    let newWatchlist = [];
    watchlist.forEach((companyCodeString) => {
      if (!isEqual(companyCodeString, code)) {
        newWatchlist.push(companyCodeString);
      }
    });

    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser, socket)
      .then(() => {
        this.setState({
          isInWatchlist: false,
        });
        this.props.openSnackbar(code, "Removed");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  setStateIsInWatchlist = () => {
    const { code } = this.props.rowData;
    const { watchlist } = this.props.userSession;

    this.setState({
      isInWatchlist: watchlist.includes(code),
    });
  };

  setStateHoldingInformation = (lastPrice, buyPriceAvg, holding) => {
    let brokerage;

    /**
     * Brokerage ( phí giao dịch )
     * Case 1 : tổng giá trị giao dịch ( sell/buy ) bé hơn bằng 10000 $ thì brokerage = 20 $
     * Case 2 : tổng giá trị trị giao dịch lớn hơn 10 000$ thì brokerage = 20$ + 0.25% ( tổng giá trị giao dịch - 10000 $ )
     * ví dụ : buy/sell lượng cổ phiếu giá 15 000 thì brokerage = 20 + 0.25% * 5000
     */

    if (lastPrice * holding <= 10000) {
      brokerage = 20;
    } else {
      brokerage = 20 + (0.25 / 100) * (lastPrice * holding - 10000);
    }

    if (lastPrice && !isEqual(this.state.lastPrice, lastPrice)) {
      this.setState({
        lastPrice: roundNumber(lastPrice, 2),
        profitOrLoss: roundNumber(
          (lastPrice - buyPriceAvg) * holding - brokerage,
          2
        ),
      });
    }
  };

  updateHoldingInformation = () => {
    // const { code, holding, buyPriceAvg } = this.props.rowData;
    // getFullStockInfo(code)
    //   .then((fullStockInfo) => {
    //     console.log(fullStockInfo);
    //     const { price } = fullStockInfo;
    //     this.setStateHoldingInformation(price, buyPriceAvg, holding);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  componentDidMount() {
    this.setStateIsInWatchlist();

    this.updateHoldingInformation();

    this.checkStockPriceInterval = setInterval(
      () => this.updateHoldingInformation(),
      30 * oneSecond
    );
  }

  componentWillUnmount() {
    clearInterval(this.checkStockPriceInterval);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const userSessionKeys = ["watchlist"];
    const compareKeys = [
      "classes",
      "isMarketClosed",
      ...userSessionKeys.map((key) => "userSession." + key),
    ];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, minimal } = this.props;
    const { isInWatchlist } = this.state;

    return (
      <TableRow>
        {this.chooseTableCell("Code", classes)}
        {!minimal && this.chooseTableCell("Holding", classes)}
        {!minimal && this.chooseTableCell("Buy Price (Avg)", classes)}
        {!minimal && this.chooseTableCell("Last Price", classes)}
        {this.chooseTableCell("Profit/Loss", classes)}
        {!minimal && (
          <TableCell
            align="center"
            className={clsx(classes.tableCell, {
              [classes.lastRightCell]: this.isTableRowTheLast(),
              [classes.lastRow]: this.isTableRowTheLast(),
            })}
          >
            <div className={classes.cellDiv}>
              {!isInWatchlist && (
                <IconButton
                  className={classes.addWatchlistButton}
                  onClick={this.addToWatchlist}
                >
                  <AddBoxRoundedIcon className={classes.watchlistIcon} />
                </IconButton>
              )}
              {isInWatchlist && (
                <IconButton
                  className={classes.removeWatchlistButton}
                  onClick={this.removeFromWatchlist}
                >
                  <DeleteForeverRoundedIcon className={classes.watchlistIcon} />
                </IconButton>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(HoldingsTableRow)));
