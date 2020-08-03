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
  oneSecond,
  oneMinute,
  convertToLocalTimeString,
  newDate
} from '../../utils/DayTimeUtil';

import {
  checkMarketClosed,
  socketCheckMarketClosed, 
  offSocketListeners
} from '../../utils/SocketUtil';

import {
  checkStockQuotesToCalculateSharesValue, 
  getUserData
} from '../../utils/UserUtil';

import {
  updateCachedSharesList, 
  getCachedSharesList, 
  getCachedAccountSummaryChartInfo, 
  updateCachedAccountSummaryChartInfoWholeList,
  updateCachedAccountSummaryChartInfoOneItem
} from '../../utils/RedisUtil';


import AppBar from './AppBar';
import Reminder from '../Reminder/Reminder';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
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
    hideReminder: false,
  }

  marketCountdownInterval;
  checkStockQuotesInterval;
  accountSummaryChartSeriesInterval;

  updateCachedAccountSummaryChartSeries = () => {
    const { email, totalPortfolio } = this.props.userSession;
    updateCachedAccountSummaryChartInfoOneItem(email, convertToLocalTimeString(newDate()), totalPortfolio)
    .catch(err => {
        console.log(err);
    });
  }

  setStateIfUserFinishedSettingUpAccount = () => {
    const { firstName, lastName, region, occupation } = this.props.userSession;
    const { isUserFinishedSettingUpAccount } = this.state;

    if( (!firstName || !lastName || !region || !occupation) && isUserFinishedSettingUpAccount ) {
      this.setState({
        isUserFinishedSettingUpAccount: false
      });
    }

    if( firstName && lastName && region && occupation && !isUserFinishedSettingUpAccount ) {
      this.setState({
        isUserFinishedSettingUpAccount: true
      });
    }
  }

  setupIntervals = () => {
    this.marketCountdownInterval = setInterval( 
      () => marketCountdownUpdate(this.setState.bind(this), this.props.isMarketClosed),
      oneSecond
    );

    this.checkStockQuotesInterval = setInterval(
      () => checkStockQuotesToCalculateSharesValue(
        this.props.isMarketClosed,
        this.props.userSession,
        this.props.mutateUser,
      ),
      5 * oneSecond
      //20 * oneSecond
    );

    this.accountSummaryChartSeriesInterval = setInterval(
      () => this.updateCachedAccountSummaryChartSeries(),
      oneMinute
    );
  }

  setupSharesListForCaching = () => {
    const { email } = this.props.userSession;
    getCachedSharesList(email)
    .then(res => {
      const { data: cachedShares } = res;
      if(isEmpty(cachedShares)) {
        const dataNeeded = {
          shares: true
        }
        return getUserData(dataNeeded, email);
      }
    })
    .then(sharesData => {
      if(sharesData && !isEmpty(sharesData)) {
        const { shares } = sharesData;
        return updateCachedSharesList(email, shares);
      }
    })
    .catch(err => {
      console.log(err);
    })
  }
  
  setupAccountSummaryChartForCaching = () => {
    const { email } = this.props.userSession;
    getCachedAccountSummaryChartInfo(email)
    .then(res => {
      const { data: chartInfo } = res;
      if(isEmpty(chartInfo)) {
        const dataNeeded = {
            accountSummaryChartInfo: true
        }
        return getUserData(dataNeeded, email);
      }
    })
    .then(chartInfoFromDatabase => {
      if(chartInfoFromDatabase && !isEmpty(chartInfoFromDatabase)) {
        const { accountSummaryChartInfo } = chartInfoFromDatabase;
        return updateCachedAccountSummaryChartInfoWholeList(email, accountSummaryChartInfo);
      }
    })
    .catch(err => {
      console.log(err);
    })
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
    this.setupAccountSummaryChartForCaching();
    this.setupSharesListForCaching();

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

    this.setStateIfUserFinishedSettingUpAccount();
  }

  componentWillUnmount() {
    clearInterval(this.marketCountdownInterval);
    clearInterval(this.checkStockQuotesInterval);
    clearInterval(this.accountSummaryChartSeriesInterval);

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
  isMarketClosed: state.isMarketClosed,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction(
    'default',
    userProps
  )),
  mutateMarket: (method) => dispatch(marketAction(
    method
  ))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(withRouter(Layout))
);

