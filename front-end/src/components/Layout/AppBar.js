import React, { createRef } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
    userAction,
} from '../../redux/storeActions/actions';

import { redirectToPage } from '../../utils/PageRedirectUtil';
import { logoutUser } from '../../utils/UserUtil';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

const styles = theme => ({
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: theme.palette.appBarBlue.main,
        height: '60px'
    },
    menuButton: {
        height: 'fit-content',
        width: 'fit-content',
        padding: 0,
    },
    avatarIcon: {
        height: '40px',
        width: '40px',
        [theme.breakpoints.down('xs')]: {
            height: '30px',
            width: '30px',
        },
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
        minHeight: '60px'
    },
    logo: {
        height: '50px',
        width: '50px',
        '&:hover': {
            cursor: 'pointer'
        },
    },
    navbarButton: {
        color: 'white',
        fontSize: 'small',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'smaller'
        },
        textTransform: 'none'
    },
    leftNavbarGrid: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    menuPaper: {
        backgroundColor: theme.palette.menuBackground.main,
        color: 'white',
        minWidth: '160px'
    },
    endMenuItem: {
        marginBottom: '5px'
    },
});

class PersistentAppBar extends React.Component {
    constructor(props) {
        super(props);
        this.accountAnchorRef = createRef(null);
        this.gameAnchorRef = createRef(null);
    }

    state={
        openAccountMenu: false,
        openGameMenu: false,
    }

    prevOpenAccountMenu = false
    prevOpenGameMenu = false

    toggleAccountMenu = () => {
        this.setState({
            openAccountMenu: true,
        });
    }

    toggleGameMenu = () => {
        this.setState({
            openGameMenu: true,
        });
    }

    handleClose = (event) => {
        this.setState({
            openAccountMenu: false,
            openGameMenu: false
        });
    }

    handleListKeyDown = (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.setState({
                openAccountMenu: false,
                openGameMenu: false
            });
        }
    }

    logout = () => {
        logoutUser()
        .then(() => {
            this.props.mutateUser();
        })
        .catch(err => {
            console.log(err);
        })
    }

    reFocusWhenTransitionMenu = () => {
        if (this.prevOpenAccountMenu && !this.state.openAccountMenu) {
            this.accountAnchorRef.current.focus();
        }

        if (this.prevOpenGameMenu && !this.state.openGameMenu) {
            this.gameAnchorRef.current.focus();
        }

        this.prevOpenAccountMenu = this.state.openAccountMenu;
        this.prevOpenGameMenu = this.state.openGameMenu;
    }

    componentDidMount() {
        this.reFocusWhenTransitionMenu();
    }

    componentDidUpdate() {
        this.reFocusWhenTransitionMenu();
    }

    render() {
        const { 
            classes, 
            userSession, 
        } = this.props;

        const {
            openAccountMenu,
            openGameMenu
        } = this.state;

        return(
            <AppBar
                position="fixed"
                className={classes.appBar}
            >
                <Toolbar className={classes.toolbar}>
                    <img 
                        src="/bib.png"
                        alt="Bibliko"
                        className={classes.logo}
                        onClick={() => { redirectToPage('/', this.props) }}
                    />
                    <Grid className={classes.leftNavbarGrid}>
                        <Button 
                            className={classes.navbarButton} 
                            ref={this.gameAnchorRef}
                            aria-controls={openGameMenu ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={this.toggleGameMenu}
                        >
                            Game
                        </Button>
                        <Popper 
                            open={openGameMenu} 
                            anchorEl={this.gameAnchorRef.current} 
                            role={undefined} 
                            transition 
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                >
                                    <Paper className={classes.menuPaper}>
                                        <ClickAwayListener onClickAway={this.handleClose}>
                                            <MenuList autoFocusItem={openGameMenu} id="menu-list-grow" onKeyDown={this.handleListKeyDown}>
                                                <MenuItem dense disabled>Transactions</MenuItem>
                                                <MenuItem dense>Buy Stocks</MenuItem>
                                                <MenuItem dense>Trading History</MenuItem>
                                                <MenuItem dense className={classes.endMenuItem}>Pending Orders</MenuItem>

                                                <MenuItem dense disabled>List</MenuItem>
                                                <MenuItem dense>Watchlist</MenuItem>
                                                <MenuItem dense className={classes.endMenuItem}>Companies</MenuItem>

                                                <MenuItem dense disabled>Explore</MenuItem>
                                                <MenuItem dense>Charts</MenuItem>
                                                <MenuItem dense>Ranking</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                        <Button className={classes.navbarButton}>
                            Education
                        </Button>
                        <Button className={classes.navbarButton}>
                            About Us
                        </Button>
                        <IconButton
                            color="inherit"
                            component="span"
                            edge="end"
                            className={classes.menuButton}
                            ref={this.accountAnchorRef}
                            aria-label="Account Menu"
                            aria-controls={openAccountMenu ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={this.toggleAccountMenu}
                            disableRipple
                        >
                            {
                                _.isEmpty(userSession.avatarUrl)?
                                <AccountCircleRoundedIcon className={classes.avatarIcon}/>:
                                <Avatar className={classes.avatarIcon} src={userSession.avatarUrl}/>
                            }   
                        </IconButton>
                        <Popper 
                            open={openAccountMenu} 
                            anchorEl={this.accountAnchorRef.current} 
                            role={undefined} 
                            transition 
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                >
                                    <Paper className={classes.menuPaper}>
                                        <ClickAwayListener onClickAway={this.handleClose}>
                                            <MenuList autoFocusItem={openAccountMenu} id="menu-list-grow" onKeyDown={this.handleListKeyDown}>
                                                <MenuItem>Account Settings</MenuItem>
                                                <MenuItem
                                                    onClick={() => { redirectToPage('/accountSummary', this.props); }}
                                                >
                                                    Portfolio
                                                </MenuItem>
                                                <MenuItem onClick={this.logout}>Log Out</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }
}

const mapStateToProps = (state) => ({
    userSession: state.userSession
});

const mapDispatchToProps = (dispatch) => ({
    mutateUser: () => dispatch(userAction(
        'logout',
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(PersistentAppBar))
);
