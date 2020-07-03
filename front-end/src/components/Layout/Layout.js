import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  userAction
} from '../../redux/storeActions/actions';

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
    justifyContent: 'center',
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
});

class Layout extends React.Component {
  redirect = (link) => {
    const { history } = this.props;
    history.push(link);
  } 

  componentCheck = () => {
    if(_.isEmpty(this.props.userSession)) {
      this.redirect('/login');
    }
  }

  componentDidMount() {
    this.context.getUser() 
    .then(user => {
      this.props.mutateUser(user.data);
    })
    .catch(err => {
      console.log(err);
    })
  }

  componentDidUpdate() {
    this.componentCheck();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar />
        <main>
          <div className={classes.contentHeader}/>
          <div className={classes.mainContent}>
            <div className={classes.mainBackground}/>
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

