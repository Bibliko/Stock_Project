import React from 'react';
import {
  withRouter,
  Switch,
  Route,
} from "react-router-dom";
import { Provider } from 'react-redux';
import store from './redux/store';

import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Signup from './pages/Login/Signup';
import ForgotPassword from './pages/Login/ForgotPassword';
import Succeed from './pages/Login/Verification/Succeed';
import Fail from './pages/Login/Verification/Fail';
import UserProvider from './contexts/UserProvider';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import logo from './logo.svg';
import './css/App.css';

function Test() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

class App extends React.Component {
  
  specialLinks = [
    '/login', 
    '/signup', 
    '/forgotpassword',
    '/verificationSucceed',
    '/verificationFail'
  ]

  state = {
    path: "",
    prefersDarkMode: false
  }

  theme = {
    palette: {
      primary: {
        main: '#2196f3'
      },

      barButton: {
        main: 'linear-gradient(45deg, #2196f3, #03b6fc)',
      },

      subText: {
        main: 'rgba(5, 5, 5, 1)'
      },

      type: 'light'
    },
  }

  ColorLuminance(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }

    return rgb;
  }

  muiTheme = {}

  toggleTheme = () => {
    const { prefersDarkMode } = this.state;
    this.setState({
      prefersDarkMode: !prefersDarkMode
    })
  }

  createTheme = () => {
    const { prefersDarkMode } = this.state;
    this.theme.palette.type = prefersDarkMode ? 'dark' : 'light';
    this.muiTheme = this.customizeTheme(createMuiTheme(this.theme));
    return this.muiTheme;
  }

  customizeTheme = (theme) => {
    theme.getColor = this.getColor;
    for (let colorKey in theme.palette) {
      const color = theme.palette[colorKey];
      if (color.main) {
        if (!color.light)
          theme.palette[colorKey].light = this.ColorLuminance(color.main, 0.2);
        if (!color.dark)
          theme.palette[colorKey].dark = this.ColorLuminance(color.main, -0.2);
      }
    }
    return theme;
  }

  getColor = (colorChoice) => {
    const { prefersDarkMode } = this.state;
    for (let colorKey in this.muiTheme.palette) {
      if (colorKey === colorChoice) {
        const color = this.muiTheme.palette[colorKey];
        return prefersDarkMode ? color.dark : color.light;
      }
    }
  }

  changePath = () => {
    const { pathname } = this.props.location;
    if (pathname !== this.state.path)
      this.setState({ path: pathname });
  }

  componentDidMount() {
    this.changePath();
  } 

  componentDidUpdate() {
    this.changePath();
  }

  render() {
    return (
      <UserProvider>
        <ThemeProvider theme={this.createTheme()}>
          <Provider store={store}>
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
                  <Route path="/" component={Test}/>
                  {/* <Route exact path="/browse" component={Browse} /> */}
                </Layout>
              </Switch>
            }
          </Provider>
        </ThemeProvider>
      </UserProvider>
    );
  }
}

export default withRouter(App);
