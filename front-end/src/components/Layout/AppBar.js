import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

const styles = theme => ({
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
    },
    menuButton: {
        maxHeight: 'fit-content',
        maxWidth: 'fit-content',
        padding: 0,
        marginRight: -5
    },
    avatarIcon: {
        fontSize: '-webkit-xxx-large',
    },
    hide: {
        display: 'none',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
});

class PersistentAppBar extends React.Component {

    render() {
        const { 
            classes, 
            user, 
            toggleDrawer 
        } = this.props;

        return(
            <AppBar
                position="fixed"
                className={classes.appBar}
            >
                <Toolbar className={classes.toolbar}>
                    <Typography variant="h6" noWrap>
                        Bibliko
                    </Typography>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer(true)}
                        edge="end"
                        className={classes.menuButton}
                    >
                        {
                            _.isEmpty(user.avatarUrl)?
                            <AccountCircleRoundedIcon className={classes.avatarIcon}/>:
                            <Avatar src={user.avatarUrl}/>
                        }
                    </IconButton>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(withRouter(PersistentAppBar));

