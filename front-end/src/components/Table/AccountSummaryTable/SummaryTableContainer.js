import React from 'react';
import { withRouter } from 'react-router';
import clsx from 'clsx';
//import _ from 'lodash';
//import fetch from 'node-fetch';

import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';

import ArrowDropUpRoundedIcon from '@material-ui/icons/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';

const styles = theme => ({
    table: {
        width: '100%',
        border: 'hidden'
    },
    tableCell: {
        border: 'hidden'
    },
    tableCellCenter: {
        border: 'hidden',
        display: 'flex',
        alignItems: 'center'
    },
    arrowUp: {
        color: '#219653'
    },
    arrowDown: {
        color: '#ef0808'
    },
});

const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#EB5757',
      },
      '&:nth-of-type(even)': {
        backgroundColor: '#FE8383'
      }
    },
}))(TableRow);

class SummaryTableContainer extends React.Component {

    checkIfDailyChangeUpOrDown = (type) => {
        if(type==="Daily Change" && this.props.userDailyChange >= 0) {
            return 'Up';
        }
        if(type==="Daily Change" && this.props.userDailyChange < 0) {
            return 'Down';
        }
    }

    chooseTableRowValue = (type) => {
        switch(type) {
            case 'Cash':
                return `$${this.props.cash}`;

            case 'Shares':
                let shares = this.props.userSharesValue;
                if(typeof shares === "number") {
                    shares = shares.toFixed(2);
                    return `$${shares}`;
                }
                return `$${(this.props.totalPortfolio-this.props.cash).toFixed(2)}`;

            case 'Total Portfolio Value':
                return `$${this.props.totalPortfolio}`;

            case 'Daily Change':
                if(this.props.userDailyChange < 0) {
                    return `-$${Math.abs(this.props.userDailyChange)}`;
                }
                return `$${this.props.userDailyChange}`;

            case 'Overall Rank':
                return `${this.props.ranking}`;

            default:
                return;
        }

    }

    chooseTableRow = (type, classes) => {
        return (
            <StyledTableRow>
                <TableCell 
                    component="th" scope="row" align="left"
                    className={classes.tableCell}    
                >
                    {type}
                </TableCell>
                <TableCell 
                    align="left"
                    className={clsx(classes.tableCellCenter, {
                        [classes.arrowUp]: this.checkIfDailyChangeUpOrDown(type)==="Up",
                        [classes.arrowDown]: this.checkIfDailyChangeUpOrDown(type)==="Down"
                    })} 
                >
                    {
                        this.chooseTableRowValue(type)
                    }
                    {
                        this.checkIfDailyChangeUpOrDown(type)==="Up" &&
                        <ArrowDropUpRoundedIcon className={classes.arrowUp}/>
                    }
                    {
                        this.checkIfDailyChangeUpOrDown(type)==="Down" &&
                        <ArrowDropDownRoundedIcon className={classes.arrowDown}/>
                    }
                </TableCell>
            </StyledTableRow>
        );
    }

    render() {
        const { 
            classes, 
        } = this.props;

        return (   
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableBody>
                        { this.chooseTableRow('Cash', classes) }
                        { this.chooseTableRow('Shares', classes) }
                        { this.chooseTableRow('Total Portfolio Value', classes) }
                        { this.chooseTableRow('Daily Change', classes) }
                        { this.chooseTableRow('Overall Rank', classes) }
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}

const mapStateToProps = (state) => ({
    userSharesValue: state.userSharesValue
});

export default connect(mapStateToProps, null)(
    withStyles(styles)(withRouter(SummaryTableContainer))
);