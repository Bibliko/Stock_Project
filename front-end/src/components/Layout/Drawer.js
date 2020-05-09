import React, { useContext } from 'react';
import { withRouter } from 'react-router';

import UserProvider from '../../contexts/UserProvider';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MeetingRoomRoundedIcon from '@material-ui/icons/MeetingRoomRounded';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
}));

function PersistentDrawer(props) {
    const { logoutUser } = useContext(UserProvider.context);
    const classes = useStyles();
    const theme = useTheme();

    const logout = () => {
        const { history } = props;

        logoutUser()
        .then(() => {
            history.push('/login');
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={props.open}
            classes={{
                paper: classes.drawerPaper,
            }}
            >
            <div className={classes.drawerHeader}>
                <IconButton onClick={props.handleDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </div>
            <Divider />
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                <ListItem button key={text}>
                    <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                    <ListItemText primary={text} />
                </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                <ListItem button key={text}>
                    <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                    <ListItemText primary={text} />
                </ListItem>
                ))}
            </List>
            <Divider/>
            <List>
                <ListItem button onClick={logout}>
                    <ListItemIcon>
                        <MeetingRoomRoundedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Log Out"/>
                </ListItem>
            </List>
        </Drawer>
    );
}

export default withRouter(PersistentDrawer);