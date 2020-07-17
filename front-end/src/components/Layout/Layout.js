import React from 'react';
import { withRouter } from 'react-router';
import _ from 'lodash';
//import moment from 'moment-timezone';
import { connect } from 'react-redux';
import {
  userAction,
  marketAction
} from '../../redux/storeActions/actions';

import { shouldRedirectToLogin, redirectToPage } from '../../utils/PageRedirectUtil';
import { 
  marketCountdownUpdate, 
  isMarketClosedCheck,
  oneSecond 
} from '../../utils/DayTimeUtil';

import AppBar from './AppBar';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  
  //content. Write new CSS above this comment
  mainContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw'
  },

  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    //...theme.mixins.toolbar,
    minHeight: '60px',
    justifyContent: 'flex-start',
  },

  mainBackground: {
    backgroundColor: theme.palette.backgroundBlue.main,
    [theme.breakpoints.down('xs')]: {
      background: theme.palette.paperBackground.gradient
    },
    backgroundSize: 'cover',
    height: '100vh',
    width: '100vw',
    position: 'fixed'
  },

  secondBackground: {
    background: theme.palette.paperBackground.gradient,
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    },
    backgroundSize: 'cover',
    height: '100vh',
    width: '75%',
    position: 'fixed'
  },

  countdown: {
    position: 'absolute',
    marginTop: '10px',
  },

  countdownText: {
    color: 'white',
    fontSize: 'x-large',
    [theme.breakpoints.down('xs')]: {
      fontSize: 'large'
    },
  },
});

class Layout extends React.Component {
  state={
    countdown: ''
  }

  marketCountdownInterval;

  marketCountdownAndCheck = () => {
    marketCountdownUpdate(this.setState.bind(this));

    if(isMarketClosedCheck() && !this.props.isMarketClosed) {
      this.props.mutateMarket("closeMarket");
    }

    if(!isMarketClosedCheck() && this.props.isMarketClosed) {
      this.props.mutateMarket("openMarket");
    }
  }

  componentDidMount() {
    console.log(this.props.userSession);
    
    if(shouldRedirectToLogin(this.props)) {
      redirectToPage('/login', this.props);
    }

    this.marketCountdownInterval = setInterval(() => {
      marketCountdownUpdate(this.setState.bind(this));  
    }, oneSecond);
  }

  componentDidUpdate() {
    if(shouldRedirectToLogin(this.props)) {
      redirectToPage('/login', this.props);
    }
  }

  componentWillUnmount() {
    clearInterval(this.marketCountdownInterval);
  }

  render() {
    const { classes } = this.props;

    if (shouldRedirectToLogin(this.props)) {
      return null;
    }

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar />
        <main>
          <div className={classes.contentHeader}/>
          <div className={classes.mainContent}>
            <div className={classes.mainBackground}/>
            <div className={classes.secondBackground}/>
            <div className={classes.countdown}>
              {
                _.isEmpty(this.state.countdown) &&
                <CircularProgress />
              }
              {
                _.isEqual(this.state.countdown, '00:00:00') &&
                <Typography className={classes.countdownText}>
                  Market Closed
                </Typography>
              }
              {
                !_.isEmpty(this.state.countdown) && !_.isEqual(this.state.countdown, '00:00:00') &&
                <Typography className={classes.countdownText}>
                  Until Market Close {this.state.countdown}
                </Typography>
              }
            </div>
            {this.props.children}
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
  isMarketClosed: state.isMarketClosed
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction(
    'default',
    userProps
  )),
  mutateMarket: (openMarket_closeMarket) => dispatch(marketAction(
    openMarket_closeMarket
  ))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(withRouter(Layout))
);

