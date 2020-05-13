import React, { useContext } from 'react';
import { withRouter } from 'react-router';

import UserProvider from '../../contexts/UserProvider';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import TuneRoundedIcon from '@material-ui/icons/TuneRounded';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import ShoppingCartRoundedIcon from '@material-ui/icons/ShoppingCartRounded';
import AccountBoxRoundedIcon from '@material-ui/icons/AccountBoxRounded';
import HistoryRoundedIcon from '@material-ui/icons/HistoryRounded';
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
}));

function PersistentDrawer(props) {
    const { logoutUser } = useContext(UserProvider.context);
    const classes = useStyles();

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
                        text==="Buy Stock"? <ShoppingCartRoundedIcon/>:
                        text==="Portfolio"? <AccountBoxRoundedIcon/>:
                        text==="Trading History"? <HistoryRoundedIcon/>:
                        text==="Pending Orders"? <TimerRoundedIcon/>:
                        text==="Watchlist"? <ListAltRoundedIcon/>:
                        text==="Companies"? <BusinessRoundedIcon/>:
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
            anchor="right"
            open={props.open}
            classes={{
                paper: classes.drawerPaper,
            }}
            onClose={props.toggleDrawer(false)}
        >
            <List>
                {[
                    'Dashboard', 
                ].map((text) => 
                    menuComponents(text)
                )}
            </List>
            <Divider />
            <List
                subheader={
                    <ListSubheader disableSticky={true}>
                        Account
                    </ListSubheader>
                }
            >
                {[
                    'Account Settings',
                    'Portfolio', 
                ].map((text) => 
                    menuComponents(text)
                )}
            </List>
            <Divider/>
            <List
                subheader={
                    <ListSubheader disableSticky={true}>
                        Transactions
                    </ListSubheader>
                }
            >
                {[
                    'Buy Stock',  
                    'Trading History',
                    'Pending Orders',

                ].map((text) => 
                    menuComponents(text)
                )}
            </List>
            <Divider/>  
            <List
                subheader={
                    <ListSubheader disableSticky={true}>
                        List
                    </ListSubheader>
                }
            >
                {[
                    'Watchlist',
                    'Companies',
                ].map((text) => 
                    menuComponents(text)
                )}
            </List>
            <Divider/>
            <List
                subheader={
                    <ListSubheader disableSticky={true}>
                        Explore
                    </ListSubheader>
                }
            >
                {[
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
                        <ExitToAppRoundedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Log Out"/>
                </ListItem>
            </List>
        </Drawer>
    );
}

export default withRouter(PersistentDrawer);