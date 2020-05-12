import React, { useContext } from 'react';
import { withRouter } from 'react-router';

import UserProvider from '../../contexts/UserProvider';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MeetingRoomRoundedIcon from '@material-ui/icons/MeetingRoomRounded';
import TuneRoundedIcon from '@material-ui/icons/TuneRounded';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import ShoppingCartRoundedIcon from '@material-ui/icons/ShoppingCartRounded';
import AccountBoxRoundedIcon from '@material-ui/icons/AccountBoxRounded';
import ReceiptRoundedIcon from '@material-ui/icons/ReceiptRounded';
import TimerRoundedIcon from '@material-ui/icons/TimerRounded';
import ListAltRoundedIcon from '@material-ui/icons/ListAltRounded';
import BusinessRoundedIcon from '@material-ui/icons/BusinessRounded';
import AssessmentRoundedIcon from '@material-ui/icons/AssessmentRounded';
import EmojiEventsRoundedIcon from '@material-ui/icons/EmojiEventsRounded';

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

    const chooseMenu = (text) => {

    }

    const menuComponents = (text) => {
        return (
            <ListItem button key={text}
                onClick={() => {
                    chooseMenu(text);
                }}
            >
                <ListItemIcon>
                    {
                        text==="Account Settings"? <TuneRoundedIcon/>:
                        text==="Dashboard"? <DashboardRoundedIcon/>:
                        text==="Place An Order"? <ShoppingCartRoundedIcon/>:
                        text==="Account Summary"? <AccountBoxRoundedIcon/>:
                        text==="Transactions"? <ReceiptRoundedIcon/>:
                        text==="Pending Orders"? <TimerRoundedIcon/>:
                        text==="Watchlist"? <ListAltRoundedIcon/>:
                        text==="Company List"? <BusinessRoundedIcon/>:
                        text==="Charts"? <AssessmentRoundedIcon/>:
                        <EmojiEventsRoundedIcon/> //text==="Rankings"
                    }
                </ListItemIcon>
                <ListItemText primary={text}/>
            </ListItem>
        );
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
                {[
                    'Account Settings'
                ].map((text) => 
                    menuComponents(text)
                )}
            </List>
            <Divider />
            <List>
                {[
                    'Dashboard', 
                    'Place An Order', 
                    'Account Summary', 
                    'Transactions',
                    'Pending Orders',
                    'Watchlist',
                    'Company List',
                    'Charts',
                    'Rankings'

                ].map((text) => 
                    menuComponents(text)
                )}
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