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
        width: '700px',
        border: 'hidden'
    },
    tableContainer: {

        borderRadius: '4px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    tableCell: {
        fontSize: '20px',
        //border: 'hidden',
        color:'#FFFFFF',
        borderColor: '#DC3D4A',
        borderStyle: 'solid',
        borderBottom: 'hidden'
    },
    tableCellCenter: {
        //fontSize: '20px',
        border: 'hidden',
        //display: 'flex',
        alignItems: 'center'
    },
    headColor: {
        backgroundColor: '#EB5757',
    },
    headtitle: {
        fontSize: '25px',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'large'
        },
        fontWeight: 'bold',
        //marginBottom: '1px'
        color: '#FFFFFF',
        align: 'center'
    },

});

const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#FFA9A9',
      },
      '&:nth-of-type(even)': {
        backgroundColor: '#FE8383'
      }
    },
}))(TableRow);

class OverallTable extends React.Component {
    
    chooseTableRowValue = (type) => {
        switch(type) {
            case '':
                return ``;

            case '':
                return ``;

            case '':
                return ``;

            case '':
                return ``;

            case '':
                //return `${this.props.PortfolioHigh}`;
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
                    component="th" scope="row" align="left"
                    className={classes.tableCell}    
                >
                    
                </TableCell>
                <TableCell 
                    component="th" scope="row" align="left"
                    className={classes.tableCell}    
                >
                    
                </TableCell>
                <TableCell 
                    component="th" scope="row" align="left"
                    className={classes.tableCell}    
                >
                    
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
                        <TableRow className={classes.headColor}>
                            <TableCell 
                                component="th" scope="row" align="left"
                                className={classes.tableCellCenter}
                                align='center'   
                            >
                                <Typography className={classes.headtitle}>
                                    #
                                </Typography>
                            </TableCell>
                            <TableCell 
                                component="th" scope="row" align="left"
                                //className={classes.tableCell}
                                className={classes.tableCellCenter}
                                align='center'
                            >
                                <Typography className={classes.headtitle}>
                                    Username
                                </Typography>
                            </TableCell>
                            <TableCell 
                                component="th" scope="row" align="left"
                                //lassName={classes.tableCell}
                                className={classes.tableCellCenter}
                                align='center'
                            >
                                <Typography className={classes.headtitle}>
                                    Portfolio
                                </Typography>
                            </TableCell>
                            <TableCell 
                                component="th" scope="row" align="left"
                                //className={classes.tableCell}   
                                className={classes.tableCellCenter}
                                align='center'
                            >
                                <Typography className={classes.headtitle}>
                                    Region
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { this.chooseTableRow('1', classes) }
                        { this.chooseTableRow('2', classes) }
                        { this.chooseTableRow('3', classes) }
                        { this.chooseTableRow('4', classes) }
                        { this.chooseTableRow('5', classes) }
                        { this.chooseTableRow('6', classes) }
                        { this.chooseTableRow('7', classes) }
                        { this.chooseTableRow('8', classes) }
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
    withStyles(styles)(withRouter(OverallTable))
);