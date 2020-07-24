import React from 'react';
import {
  withRouter,
  Switch,
  Route,
} from "react-router-dom";
import axios from 'axios';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import initializeStoreState from './redux/storeReducer';

import socketIOClient from "socket.io-client";
import { updateUserDataForSocket } from './utils/SocketUtil';

import Login from './pages/Login/Login';
import Signup from './pages/Login/Signup';
import ForgotPassword from './pages/Login/ForgotPassword';
import Succeed from './pages/Login/Verification/Succeed';
import Fail from './pages/Login/Verification/Fail';
import LandingPage from './pages/Main/LandingPage';
import AccountSummary from './pages/Main/AccountSummary';

import Layout from './components/Layout/Layout';
import { createTheme } from './theme/ThemeUtil';

import { ThemeProvider } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

var socket;

const BACKEND_HOST = `${window.location.origin}/api`;

class App extends React.Component {

  constructor(props) {
    super(props);
    socket = socketIOClient(process.env.REACT_APP_BACKEND_HOST_FOR_SOCKET);
  }

  // variables
  specialLinks = [
    '/login', 
    '/signup', 
    '/forgotpassword',
    '/verificationSucceed',
    '/verificationFail'
  ]

  state = {
    path: "",
    isAppReady: false
  }

  reduxStore_USE_THE_ACCESSOR = undefined
  reduxStoreInitialState = undefined

  // setupRedux
  setupReduxStoreState = () => {
    axios.get(`${BACKEND_HOST}/user`, {withCredentials: true})
    .then(user => {
      this.reduxStoreInitialState = {
        userSession: user.data,
        userSharesValue: -1,
        isMarketClosed: false,
      };

      this.setState({
        isAppReady: true
      });
    })
    .catch(e => {
      console.log(e);
    })
  }

  getReduxStore = () => {
    if (this.reduxStore_USE_THE_ACCESSOR === undefined) {
      this.reduxStore_USE_THE_ACCESSOR = createStore(
        initializeStoreState(this.reduxStoreInitialState)
      );
    }
    //console.log(this.reduxStoreInitialState);
    return this.reduxStore_USE_THE_ACCESSOR;
  }
  
  // componentDid... related
  changePath = () => {
    const { pathname } = this.props.location;
    if (pathname !== this.state.path) {
      this.setState({ 
        path: pathname 
      });
    }
  }

  componentDidMount() {
    this.changePath();
    this.setupReduxStoreState();
  } 

  componentDidUpdate() {
    this.changePath();
    if(this.state.isAppReady) {
      updateUserDataForSocket(socket);
    }
  }

  render() {
    const { isAppReady } = this.state;

    if(!isAppReady) {
      return <LinearProgress />
    }

    return (
      <ThemeProvider theme={createTheme()}>
        <Provider store={this.getReduxStore()}>
          {
            this.state.path==="/login" &&
            <Login/>
          }
          {
            this.state.path==="/signup" &&
            <Signup/>
          }
          {
            this.state.path==="/forgotpassword" &&
            <ForgotPassword/>
          }
          {
            this.state.path==="/verificationSucceed" &&
            <Succeed/>
          }
          {
            this.state.path==="/verificationFail" &&
            <Fail/>
          }
          {
            !this.specialLinks.includes(this.state.path) &&
            <Switch>
              <Layout toggleTheme={this.toggleTheme}>
                <Route exact path="/" component={LandingPage} />

                <Route path="/accountSummary" component={AccountSummary} />
              </Layout>
            </Switch>
          }
        </Provider>
      </ThemeProvider>
    );
  }
}

export { socket };
export default withRouter(App);
