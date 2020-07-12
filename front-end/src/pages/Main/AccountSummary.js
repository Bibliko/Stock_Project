import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';
//import _ from 'lodash';
//import fetch from 'node-fetch';

import { connect } from 'react-redux';
import { socket } from '../../App';
// import {
//     userAction,
// } from '../../redux/storeActions/actions';

import { checkStockQuotesForUser, updateUserDataForSocket } from '../../utils/SocketUtil';
import { calculateTotalSharesValue } from '../../utils/UserUtil';

import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';

const styles = theme => ({
    root: { 
        position: 'absolute',
        height: '100%',
        width: '75%',
        [theme.breakpoints.down('xs')]: {
            width: '85%',
        },
        background: 'rgba(0,0,0,0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'none',
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flexBasis: 'unset',
    },
    fullHeightWidth: {
        height: '100%',
        width: '100%'
    },
    itemGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
        minHeight: '125px',
        //maxHeight: '300px'
    },
    gridTitle: {
        fontSize: '25px',
        [theme.breakpoints.down('md')]: {
            fontSize: '15px'
        },
        fontWeight: 'bold',
        marginBottom: '5px'
    },
    marketWatch: {
        color: '#FF3747'
    },
    stocksOnTheMove: {
        color: '#74E0EF'
    },
    accountSummary: {
        color: '#F2C94C'
    },
    rankings: {
        color: '#9ED2EF'
    },
});

class AccountSummary extends React.Component {
    state = {
        error: "",
        userTotalSharesValue: 0
    }

    componentDidMount() {
        // example of stockQuotesJSON in back-end/utils/FinancialModelingPrepUtil.js
        socket.on(checkStockQuotesForUser, (stockQuotesJSON) => {
            calculateTotalSharesValue(stockQuotesJSON, this.props.userSession.email)
            .then(totalSharesValue => {
                this.setState({
                    userTotalSharesValue: totalSharesValue
                });
            })
            .catch(err => {
                console.log(err);
            })
        })
    }

    componentDidUpdate() {
        updateUserDataForSocket(socket);
    }

    render() {
        const { classes } = this.props;

        return (
            <Container className={classes.root} disableGutters>
                <Grid container spacing={6} direction="row"
                    className={classes.fullHeightWidth}
                >
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle, classes.marketWatch)}>
                            MARKET WATCH
                        </Typography>
                        <Paper className={classes.fullHeightWidth}/>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle, classes.stocksOnTheMove)}>
                            STOCKS ON THE MOVE
                        </Typography>
                        <Paper className={classes.fullHeightWidth}/>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle, classes.accountSummary)}>
                            ACCOUNT SUMMARY
                        </Typography>
                        <Paper className={classes.fullHeightWidth}/>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle, classes.rankings)}>
                            RANKINGS
                        </Typography>
                        <Paper className={classes.fullHeightWidth}/>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    userSession: state.userSession,
});

export default connect(mapStateToProps)(
    withStyles(styles)(withRouter(AccountSummary))
);