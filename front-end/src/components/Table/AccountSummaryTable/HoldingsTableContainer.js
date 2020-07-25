import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import HoldingsTableRow from './HoldingsTableRow';

import { withStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';

const styles = theme => ({
    table: {
        width: '100%',
        border: 'hidden'
    },
    tableContainer: {
        borderRadius: '4px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    tableCellProfitOrLoss: {
        minWidth: '120px'
    },
    tableCell: {
        fontSize: '12px',
        border: 'hidden',
    },
    cellDiv: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    widthIfBuyPriceOrLastPrice: {
        minWidth: '100px'
    },
});

const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: '#9ED2EF',
    },
}))(TableCell);

class HoldingsTableContainer extends React.Component {

    chooseTableCell = (type, classes) => {
        return (
            <StyledTableCell align="center"
                className={clsx(classes.tableCell, {
                    [classes.tableCellProfitOrLoss]: type==="Profit/Loss"
                })}
            >
                <div className={clsx(classes.cellDiv, {
                    [classes.widthIfBuyPriceOrLastPrice]: type==="Buy Price (Avg)" || type==="Last Price"
                })}>
                    {type}
                </div>
            </StyledTableCell>
        );
    }

    render() {
        const { 
            classes, 
            rows
        } = this.props;

        return (   
            <TableContainer className={classes.tableContainer}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            { this.chooseTableCell('Code', classes) }
                            { this.chooseTableCell('Holding', classes) }
                            { this.chooseTableCell('Buy Price (Avg)', classes) }
                            { this.chooseTableCell('Last Price', classes) }
                            { this.chooseTableCell('Profit/Loss', classes) }
                            { this.chooseTableCell('Actions', classes) }
                            { this.chooseTableCell('Watchlist', classes) }
                        </TableRow>
                    </TableHead>
                    <TableBody className={classes.tableBody}>
                        {rows.map((row) => (
                            <HoldingsTableRow
                                key={row.id}
                                rowData={row}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}

export default withStyles(styles)(withRouter(HoldingsTableContainer));