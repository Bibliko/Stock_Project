import React from 'react';
import { withRouter } from 'react-router';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import {
  userAction, 
  marketAction,
} from '../../redux/storeActions/actions';

import { socket } from '../../App';

import { 
  shouldRedirectToLogin, 
  redirectToPage 
} from '../../utils/PageRedirectUtil';

import { 
  marketCountdownUpdate, 
  oneSecond
} from '../../utils/DayTimeUtil';

import {
  checkMarketClosed,
  socketCheckMarketClosed, 
  offSocketListeners
} from '../../utils/SocketUtil';

import {
  checkStockQuotesToCalculateSharesValue
} from '../../utils/UserUtil';


import AppBar from './AppBar';
import Reminder from '../Reminder/Reminder';

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
    background: '#180B66',
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    },
    backgroundSize: 'cover',
    height: '100vh',
    width: '75%',
    position: 'fixed'
  },
  thirdBackground: {
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
    marginTop: '65px',
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
    countdown: '',
    isUserFinishedSettingUpAccount: true,
    hideReminder: false
  }

  marketCountdownInterval;

  checkStockQuotesInterval;

  setStateIfUserFinishedSettingUpAccount = () => {
    const { firstName, lastName, region, occupation } = this.props.userSession;

    if( !firstName || !lastName || !region || !occupation ) {
      this.setState({
        isUserFinishedSettingUpAccount: false
      });
    }
  }

  setupIntervals = () => {
    this.marketCountdownInterval = setInterval( 
      () => marketCountdownUpdate(this.setState.bind(this)),
      oneSecond
    );

    this.checkStockQuotesInterval = setInterval(
      () => checkStockQuotesToCalculateSharesValue(
        this.props.isMarketClosed,
        this.props.userSession,
        this.props.userSharesValue,
        this.props.mutateUser,
        this.props.mutateUserSharesValue
      ),
      5 * oneSecond
      //20 * oneSecond
    );
  }

  marketCountdownChooseComponent = (classes) => {
    if(this.props.isMarketClosed) {
      return (
        <Typography className={classes.countdownText}>
          Market Closed
        </Typography>
      );
    }
    else {
      if(isEmpty(this.state.countdown)) {
        return ( 
          <CircularProgress/>
        );
      }
      else {
        return (
          <Typography className={classes.countdownText}>
            Until Market Close {this.state.countdown}
          </Typography>
        );
      }
    }
  }

  componentDidMount() {
    console.log(this.props.userSession);
    
    if(shouldRedirectToLogin(this.props)) {
      redirectToPage('/login', this.props);
      return;
    }

    socketCheckMarketClosed(
      socket,
      this.props.isMarketClosed,
      this.props.mutateMarket
    );

    this.setStateIfUserFinishedSettingUpAccount();

    this.setupIntervals();
  }

  componentDidUpdate() {
    if(shouldRedirectToLogin(this.props)) {
      redirectToPage('/login', this.props);
    }

    if(!isEmpty(this.state.countdown) && this.props.isMarketClosed) {
      clearInterval(this.marketCountdownInterval);
      this.setState({
        countdown: ''
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.marketCountdownInterval);
    clearInterval(this.checkStockQuotesInterval);

    offSocketListeners(socket, checkMarketClosed);
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
        <Reminder 
          isUserFinishedSettingUpAccount = {this.state.isUserFinishedSettingUpAccount}
        />
        <main>
          <div className={classes.contentHeader}/>
          <div className={classes.mainContent}>
            <div className={classes.mainBackground}/>
            <div className={classes.secondBackground}/>
            <div className={classes.thirdBackground}/>
            <div className={classes.countdown}>
              {
                this.marketCountdownChooseComponent(classes)
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
  userSharesValue: state.userSharesValue,
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction(
    'default',
    userProps
  )),
  mutateUserSharesValue: (userSharesValue) => dispatch(userAction(
    'updateUserSharesValue',
    userSharesValue
  )),
  mutateMarket: (method) => dispatch(marketAction(
    method
  ))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(withRouter(Layout))
);

