import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  userAction
} from '../../redux/storeActions/actions';

import AppBar from './AppBar';
import Drawer from './Drawer';
import UserProvider from '../../contexts/UserProvider';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  
  //content. Write new CSS above this comment
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
});

class Layout extends React.Component {
  state = {
    open: false,
  }

  //drawer open and close
  toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({ open });
  };

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
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar 
          toggleDrawer={this.toggleDrawer}
        />
        <main
          className={classes.content}
        >
          <div className={classes.contentHeader}/>
          {this.props.children}
        </main>
        <Drawer 
          open={open}
          toggleDrawer={this.toggleDrawer}
        />
      </div>
    );
  }
}

Layout.contextType = UserProvider.context;

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

