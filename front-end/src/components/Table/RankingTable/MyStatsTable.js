import React from 'react';
import { withRouter } from 'react-router';
import clsx from 'clsx';

import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
//import ArrowDropUpRoundedIcon from '@material-ui/icons/ArrowDropUpRounded';
//import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import { Typography } from '@material-ui/core';

const styles = theme => ({
    table: {
        width: '550px',
        border: 'hidden'
    },
    tableContainer: {

        borderRadius: '4px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    tableCell: {
        [theme.breakpoints.down('xs')]: {
            fontSize: 'small'
        },
        border: 'hidden',
        color: 'white'
    },
    tableCellCenter: {
        [theme.breakpoints.down('xs')]: {
            fontSize: 'small'
        },
        border: 'hidden',
        display: 'flex',
        alignItems: 'center'
    },
    head: {
        backgroundColor: '#5893C9',
    },
    headtitle: {
        fontSize: 'large',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'medium'
        },
        fontWeight: 'bold',
        //marginBottom: '1px'
        color: '#FFFFFF',
    },

});

const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#78CBFA',
      },
      '&:nth-of-type(even)': {
        backgroundColor: '#63B5E3'
      }
    },
}))(TableRow);

class MyStatsTable extends React.Component {
    
    chooseTableRowValue = (type) => {
        switch(type) {
            case 'Overall ranking':
                return ``;

            case 'Region ranking':
                return ``;

            case 'Portfolio value':
                return ``;

            case 'Change from previous week':
                return ``;

            case 'Portfolio high':
                //return `${this.props.portfolioHigh}`;
                return ``;

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
                    className={classes.tableCellCenter} 
                >
                    {
                        this.chooseTableRowValue(type)
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
            <TableContainer className={classes.tableContainer}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead >
                        <TableRow className={classes.head}>
                            <TableCell 
                                align="left"
                                className={classes.tableCell}    
                            >
                                <Typography className={classes.headtitle}>
                                    Performance Summary
                                </Typography>
                            </TableCell>
                            <TableCell 
                                align="left"
                                className={classes.tableCell}    
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { this.chooseTableRow('Overall ranking:', classes) }
                        { this.chooseTableRow('Region ranking:', classes) }
                        { this.chooseTableRow('Portfolio value:', classes) }
                        { this.chooseTableRow('Change from previous week:', classes) }
                        { this.chooseTableRow('Portfolio high:', classes) }
                        { this.chooseTableRow('Portfolio low:', classes) }
                        { this.chooseTableRow('Overall rank syndicates:', classes) }
                        { this.chooseTableRow('Average syndicate value:', classes) }
                        { this.chooseTableRow('% of syndicates in profit:', classes) }
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
    withStyles(styles)(withRouter(MyStatsTable))
);