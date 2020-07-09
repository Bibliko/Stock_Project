import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  userAction
} from '../../redux/storeActions/actions';

import { shouldRedirectToLogin, redirectToPage } from '../../utils/PageRedirectUtil';

import AppBar from './AppBar';
import FunctionsProvider from '../../provider/FunctionsProvider';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';

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
    position: 'sticky'
  }
});

class Layout extends React.Component {
  componentDidMount() {
    console.log(this.props.userSession);
    
    if(shouldRedirectToLogin(this.props)) {
      redirectToPage('/login', this.props);
    }
  }

  componentDidUpdate() {
    if(shouldRedirectToLogin(this.props)) {
      redirectToPage('/login', this.props);
    }
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
            {this.props.children}
          </div>
        </main>
      </div>
    );
  }
}

Layout.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
  userSession: state.userSession
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction(
    'default',
    userProps
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(withRouter(Layout))
);

