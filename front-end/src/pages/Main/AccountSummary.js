import React from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { withRouter } from 'react-router';
//import _ from 'lodash';
//import fetch from 'node-fetch';

import { connect } from 'react-redux';
import { socket } from '../../App';
import {
    userAction,
} from '../../redux/storeActions/actions';

import { 
    updateUserDataForSocket,
} from '../../utils/SocketUtil';

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
        marginTop: '44px',
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
        userDailyChange: -1,
    }

    updateDailyChange = () => {
        const {
            totalPortfolio,
            totalPortfolioLastClosure,
        } = this.props.userSession;

        const dailyChange = (totalPortfolio-totalPortfolioLastClosure) / totalPortfolioLastClosure;

        if(!_.isEqual(dailyChange, this.state.userDailyChange)) {
            this.setState({
                userDailyChange: dailyChange
            });
        }
    }

    componentDidMount() {
        console.log(this.props.userSession);

        this.updateDailyChange();
    }

    componentDidUpdate() {
        updateUserDataForSocket(socket, this.props.userSession);
    
        this.updateDailyChange();
    }

    render() {
        const { classes } = this.props;

        const {
            cash,
            totalPortfolio,
            totalPortfolioLastClosure,
            ranking
        } = this.props.userSession;

        const userSharesValue = this.props.userSharesValue;

        const { userDailyChange } = this.state;

        console.log(`${cash}, ${totalPortfolio}, ${totalPortfolioLastClosure}, ${ranking}, ${userSharesValue}, ${userDailyChange}`);

        return (
            <Container className={classes.root} disableGutters>
                <Grid container spacing={6} direction="row"
                    className={classes.fullHeightWidth}
                >
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle, classes.marketWatch)}>
                            {totalPortfolio}
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
    userSharesValue: state.userSharesValue,
});

const mapDispatchToProps = (dispatch) => ({
    mutateUser: (userProps) => dispatch(userAction(
        'default',
        userProps
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(AccountSummary))
);