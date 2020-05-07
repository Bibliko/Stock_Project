import React from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { withRouter } from 'react-router';

import AppBar from './AppBar';
import Drawer from './Drawer';
import UserProvider from '../../contexts/UserProvider';

import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';


const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  
  //content. Write new CSS above this comment
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
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
    user: {}
  }

  //drawer open and close
  handleDrawerOpen = () => {
    this.setState({ open: true });
  };
  handleDrawerClose = () => {
    if(this.state.open) 
      this.setState({ open: false });
  };

  componentCheck = () => {
    const { history } = this.props;

    this.context.getUser()
    .then(user => {
      if(_.isEmpty(user.data))
        history.push('/login');
      else {
        if(!_.isEqual(user.data, this.state.user)) {
          this.setState({ user: user.data });
        }
      }
    })
  }

  componentDidMount() {
    this.componentCheck();
  }

  componentDidUpdate() {
    this.componentCheck();
  }

  render() {
    const { classes } = this.props;
    const { open, user } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar 
          open={open}
          handleDrawerOpen={this.handleDrawerOpen}
          user={user}
        />
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
          onClick={this.handleDrawerClose}
        >
          <div className={classes.contentHeader} />
          {this.props.children}
        </main>
        <Drawer 
          open={open}
          handleDrawerClose={this.handleDrawerClose}
        />
      </div>
    );
  }
}

Layout.contextType = UserProvider.context;

export default withStyles(styles)(withRouter(Layout));

