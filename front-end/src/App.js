import React from "react";
import { withRouter, Switch, Route } from "react-router-dom";

import { Provider } from "react-redux";
import { createStore } from "redux";
import initializeStoreState from "./redux/storeReducer";

import socketIOClient from "socket.io-client";

import { getBackendHostForSocket } from "./utils/low-dependency/NetworkUtil";
import { getUser } from "./utils/UserUtil";

import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Succeed from "./pages/Login/Verification/Succeed";
import Fail from "./pages/Login/Verification/Fail";

import HomePage from "./pages/Main/HomePage";
import AccountSummary from "./pages/Main/AccountSummary";
import Watchlist from "./pages/Main/Watchlist";
import Ranking from "./pages/Main/Ranking";
import Setting from "./pages/Main/Setting";
import Companies from "./pages/Main/Companies";
import CompanyDetail from "./pages/Main/CompanyDetail";
import TransactionsHistory from "./pages/Main/TransactionsHistory";
import PendingOrder from "./pages/Main/PendingOrder";
import PlaceOrder from "./pages/Main/PlaceOrder";

import Layout from "./components/Layout/Layout";
import { createTheme } from "./theme/ThemeUtil";

import { ThemeProvider } from "@material-ui/core/styles";
import { LinearProgress } from "@material-ui/core";

import { LocalizationProvider } from "@material-ui/pickers";

import DateFnsUtils from "@material-ui/pickers/adapter/date-fns";

var socket;

const BACKEND_HOST_FOR_SOCKET = getBackendHostForSocket();

class App extends React.Component {
  // variables
  specialLinks = [
    "/login",
    "/signup",
    "/forgotpassword",
    "/verificationSucceed",
    "/verificationFail",
  ];

  state = {
    path: "",
    isAppReady: false,
  };

  reduxStore_USE_THE_ACCESSOR = undefined;
  reduxStoreInitialState = undefined;

  // setupRedux
  setupReduxStoreState = () => {
    getUser()
      .then((user) => {
        this.reduxStoreInitialState = {
          userSession: user.data,
          userOrder: {},
          isMarketClosed: true,
        };

        this.setState({
          isAppReady: true,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  getReduxStore = () => {
    if (this.reduxStore_USE_THE_ACCESSOR === undefined) {
      this.reduxStore_USE_THE_ACCESSOR = createStore(
        initializeStoreState(this.reduxStoreInitialState)
      );
    }
    //console.log(this.reduxStoreInitialState);
    return this.reduxStore_USE_THE_ACCESSOR;
  };

  // componentDid... related
  changePath = () => {
    const { pathname } = this.props.location;
    if (pathname !== this.state.path) {
      this.setState({
        path: pathname,
      });
    }
  };

  componentDidMount() {
    socket = socketIOClient(BACKEND_HOST_FOR_SOCKET, { secure: true });

    this.changePath();
    this.setupReduxStoreState();
  }

  componentDidUpdate() {
    this.changePath();
  }

  render() {
    const { isAppReady } = this.state;

    if (!isAppReady) {
      return <LinearProgress />;
    }

    return (
      <ThemeProvider theme={createTheme()}>
        <LocalizationProvider dateAdapter={DateFnsUtils}>
          <Provider store={this.getReduxStore()}>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/forgotpassword" component={ForgotPassword} />
              <Route path="/verificationSucceed" component={Succeed} />
              <Route path="/verificationFail" component={Fail} />

              {!this.specialLinks.includes(this.state.path) && (
                <Layout toggleTheme={this.toggleTheme}>
                  <Route exact path="/" component={HomePage} />
                  <Route path="/companies" component={Companies} />
                  <Route
                    path="/company/:companyCode"
                    component={CompanyDetail}
                  />
                  <Route path="/accountSummary" component={AccountSummary} />
                  <Route path="/watchlist" component={Watchlist} />
                  <Route path="/setting" component={Setting} />
                  <Route path="/ranking" component={Ranking} />
                  <Route
                    path="/transactionsHistory"
                    component={TransactionsHistory}
                  />
                  <Route path="/pendingOrder" component={PendingOrder} />
                  <Route path="/placeOrder" component={PlaceOrder} />
                </Layout>
              )}
            </Switch>
            )}
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    );
  }
}

export { socket };
export default withRouter(App);
