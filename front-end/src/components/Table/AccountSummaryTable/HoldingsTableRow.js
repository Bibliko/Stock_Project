import React from 'react';
import { isEqual } from 'lodash';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import { connect } from 'react-redux';
import {
    userAction,
} from '../../../redux/storeActions/actions';

import {
    changeShareData,
} from '../../../utils/ShareUtil';

import {
    getStockPriceFromFMP
} from '../../../utils/FinancialModelingPrepUtil';

import {  
    oneSecond
} from '../../../utils/DayTimeUtil';

import { withStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import ArrowDropUpRoundedIcon from '@material-ui/icons/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';


const styles = theme => ({
    tableCell: {
        color: 'white',
        border: 'hidden',
    },
    tableRow: {
        background: 'transparent',
        backgroundColor: 'transparent'
    },
    cellDiv: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buyButton: {
        backgroundColor: '#27AE60',
        '&:hover': {
            backgroundColor: 'rgba(39, 174, 96, 0.8)'
        },
        margin: '2px',
        borderRadius: '10px',
        fontSize: 'smaller',
        fontWeight: 'bold',
        padding: '4px'
    },
    sellButton: {
        backgroundColor: '#EB5757',
        '&:hover': {
            backgroundColor: 'rgba(235, 87, 87, 0.8)'
        },
        margin: '2px',
        borderRadius: '10px',
        fontSize: 'smaller',
        fontWeight: 'bold',
        padding: '4px'
    },
    watchlistButton: {
        color: '#619FD7',
        '&:hover': {
            color: 'rgba(97, 159, 215, 0.8)'
        },
        padding: '5px',
    },
    watchlistIcon: {
        height: '30px',
        width: '30px'
    },
    arrowUp: {
        color: '#219653',
    },
    arrowDown: {
        color: '#ef0808',
    },
    marginLeftIfProfitOrLoss: {
        marginLeft: '12px',
    }
});

class HoldingsTableRow extends React.Component {
    state = {
        lastPrice: 'Updating',
        profitOrLoss: 'Updating'
    }

    checkStockPriceInterval;

    checkIfProfitOrLoss = (type) => {
        if(type==="Profit/Loss" && this.state.profitOrLoss >= 0) {
            return 'Profit';
        }
        if(type==="Profit/Loss" && this.state.profitOrLoss < 0) {
            return 'Loss';
        }
    }

    chooseTableCellValue = (type) => {
        const { rowData } = this.props;

        switch(type) {
            case "Code":
                return `${rowData.code}`;

            case "Holding":
                return `${rowData.holding}`;

            case "Buy Price (Avg)":
                return `$${rowData.buyPriceAvg.toFixed(2)}`;

            case "Last Price":
                return `$${this.state.lastPrice}`;

            case "Profit/Loss":
                if(parseFloat(this.state.profitOrLoss, 10) < 0) {
                    return `-$${Math.abs(parseFloat(this.state.profitOrLoss, 10))}`;
                }
                return `$${this.state.profitOrLoss}`;

            default: 
                return;
        }
    }

    chooseTableCell = (type, classes) => {
        return (
            <TableCell align="center" 
                className={clsx(classes.tableCell, {
                    [classes.arrowUp]: this.checkIfProfitOrLoss(type)==="Profit",
                    [classes.arrowDown]: this.checkIfProfitOrLoss(type)==="Loss"
                })} 
            >
                <div className={clsx(classes.cellDiv, {
                    [classes.marginLeftIfProfitOrLoss]: type==="Profit/Loss" && this.state.profitOrLoss!=="Updating"
                })}>
                    {
                        this.chooseTableCellValue(type)
                    }
                    {
                        this.checkIfProfitOrLoss(type)==="Profit" &&
                        <ArrowDropUpRoundedIcon className={classes.arrowUp}/>
                    }
                    {
                        this.checkIfProfitOrLoss(type)==="Loss" &&
                        <ArrowDropDownRoundedIcon className={classes.arrowDown}/>
                    }
                </div>
            </TableCell>
        );
    }

    setStateHoldingInformation = (lastPrice, buyPriceAvg, holding) => {
        let brokerage;

        /**
         * Brokerage ( phí giao dịch )
         * Case 1 : tổng giá trị giao dịch ( sell/buy ) bé hơn bằng 10000 $ thì brokerage = 20 $
         * Case 2 : tổng giá trị trị giao dịch lớn hơn 10 000$ thì brokerage = 20$ + 0.25% ( tổng giá trị giao dịch - 10000 $ )
         * ví dụ : buy/sell lượng cổ phiếu giá 15 000 thì brokerage = 20 + 0.25% * 5000
         */

        if(lastPrice * holding <= 10000) {
            brokerage = 20;
        }
        else {
            brokerage = 20 + 0.25/100 * (lastPrice * holding - 10000);
        }

        if(!isEqual(this.state.lastPrice, lastPrice)) {
            this.setState({
                lastPrice: lastPrice.toFixed(2),
                profitOrLoss: ((lastPrice - buyPriceAvg) * holding - brokerage).toFixed(2)
            });
        }
    }

    updateHoldingInformation = () => {

        const { id, code, holding, buyPriceAvg, lastPrice } = this.props.rowData;

        console.log(lastPrice);

        if(this.props.isMarketClosed) {
            this.setStateHoldingInformation(lastPrice, buyPriceAvg, holding);
        }
        else {
            // getStockPriceFromFMP(code)
            // .then(stockQuoteJSON => {

            //     const { price } = stockQuoteJSON;
            //     this.setStateHoldingInformation(price, buyPriceAvg, holding);

            //     const dataNeedChange = {
            //         lastPrice: price
            //     }

            //     if(!isEqual(lastPrice, price)) {
            //         return changeShareData(dataNeedChange, id);
            //     }

            // })
            // .catch(err => {
            //     console.log(err);
            // })
        }
    }

    componentDidMount() {
        this.checkStockPriceInterval = setInterval(
            () => this.updateHoldingInformation(),
            5 * oneSecond
            // 20 * oneSecond
        )
    }

    componentWillUnmount() {
       clearInterval(this.checkStockPriceInterval);
    }

    render() {
        const { 
            classes,
        } = this.props;

        return (   
            <TableRow className={classes.tableRow}>
                { this.chooseTableCell("Code", classes) }
                { this.chooseTableCell("Holding", classes) }
                { this.chooseTableCell("Buy Price (Avg)", classes) }
                { this.chooseTableCell("Last Price", classes) }
                { this.chooseTableCell("Profit/Loss", classes) }

                <TableCell align="center" 
                    className={classes.tableCell}
                >
                    <div className={classes.cellDiv}>
                        <Button className={classes.buyButton}>
                            Buy
                        </Button>
                        <Button className={classes.sellButton}>
                            Sell
                        </Button>
                    </div>
                </TableCell>

                <TableCell align="center" 
                    className={classes.tableCell}
                >
                    <div className={classes.cellDiv}>
                        <IconButton className={classes.watchlistButton}>
                            <AddBoxRoundedIcon className={classes.watchlistIcon}/>
                        </IconButton>
                    </div>
                </TableCell>
            </TableRow>
        );
    }
}

const mapStateToProps = (state) => ({
    isMarketClosed: state.isMarketClosed
});


const mapDispatchToProps = (dispatch) => ({
    mutateUser: (userProps) => dispatch(userAction(
        'default',
        userProps
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(HoldingsTableRow))
);