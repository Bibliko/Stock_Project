import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';

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
    user: {}
  }

  //drawer open and close
  toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({ open });
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
          toggleDrawer={this.toggleDrawer}
          user={user}
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

export default withStyles(styles)(withRouter(Layout));

