import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
    userAction,
} from '../../redux/storeActions/actions';

import FunctionsProvider from '../../provider/FunctionsProvider';

import { withStyles } from '@material-ui/core/styles';
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

const styles = theme => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
});

class PersistentDrawer extends React.Component {
    chooseMenu = (text) => {

    }

    menuComponents = (text) => {
        return (
            <ListItem button key={text}
                onClick={() => {
                    this.chooseMenu(text);
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

    logout = () => {
        this.context.logoutUser()
        .then(() => {
            this.props.mutateUser();
            console.log(this.props.userSession);
        })
        .catch(err => {
            console.log(err);
        })
    }

    render() {
        const { 
            classes,
            toggleDrawer,
            open
        } = this.props;

        return (
            <Drawer
                className={classes.drawer}
                anchor="right"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
                onClose={toggleDrawer(false)}
            >
                <List>
                    {[
                        'Dashboard', 
                    ].map((text) => 
                        this.menuComponents(text)
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
                        this.menuComponents(text)
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
                        this.menuComponents(text)
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
                        this.menuComponents(text)
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
                        this.menuComponents(text)
                    )}
                </List>
                <Divider/>
                <List>
                    <ListItem button onClick={this.logout}>
                        <ListItemIcon>
                            <ExitToAppRoundedIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Log Out"/>
                    </ListItem>
                </List>
            </Drawer>
        );
    }
}

PersistentDrawer.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
    userSession: state.userSession
});
  
const mapDispatchToProps = (dispatch) => ({
    mutateUser: () => dispatch(userAction(
        'logout',
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(PersistentDrawer))
);

