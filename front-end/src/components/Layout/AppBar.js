import React, { createRef } from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { socket } from "../../App";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";
import { logoutUser } from "../../utils/UserUtil";

import { leaveUserRoom } from "../../utils/SocketUtil";

import SearchFieldLayout from "../Search/SearchFieldLayout";

import { withStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Button,
  Grid,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Typography,
} from "@material-ui/core";

const styles = (theme) => ({
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: theme.palette.paperBackground.main,
    height: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      height: theme.customHeight.appBarHeightSmall,
    },
  },
  menuButton: {
    textTransform: "none",
    height: "fit-content",
    width: "fit-content",
    padding: 0,
    minWidth: "0px",
    margin: "8px",
    [theme.breakpoints.down("xs")]: {
      margin: "4px",
    },
  },
  menuButtonTitle: {
    color: theme.palette.normalFontColor.primary,
    "&:hover": {
      color: theme.palette.secondary.main,
    },
    fontSize: "small",
    [theme.breakpoints.down("xs")]: {
      fontSize: "xx-small",
    },
    fontWeight: "bold",
  },
  normalIcon: {
    height: "30px",
    width: "30px",
    [theme.breakpoints.down("xs")]: {
      height: "25px",
      width: "25px",
    },
    color: "white",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: theme.customHeight.appBarHeight,
    minHeight: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      height: theme.customHeight.appBarHeightSmall,
      minHeight: theme.customHeight.appBarHeightSmall,
    },
    padding: 0,
  },
  leftNavbarGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexGrow: 1,
  },
  rightNavbarGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "10px",
  },
  menuPaper: {
    backgroundColor: theme.palette.paperBackground.onPage,
    boxShadow: theme.customShadow.popup,
    color: "white",
    minWidth: "160px",
  },
  menuItem: {
    fontSize: "14px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
      minHeight: "20px",
    },
    "&:hover": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
  },
});

class PersistentAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.accountAnchorRef = createRef(null);
    this.gameAnchorRef = createRef(null);
  }

  state = {
    openAccountMenu: false,
    openGameMenu: false,
  };

  prevOpenAccountMenu = false;
  prevOpenGameMenu = false;

  toggleAccountMenu = () => {
    this.setState({
      openAccountMenu: true,
    });
  };

  toggleGameMenu = () => {
    this.setState({
      openGameMenu: true,
    });
  };

  handleClose = (event) => {
    this.setState({
      openAccountMenu: false,
      openGameMenu: false,
    });
  };

  handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      this.setState({
        openAccountMenu: false,
        openGameMenu: false,
      });
    }
  };

  logout = () => {
    logoutUser()
      .then(() => {
        socket.emit(leaveUserRoom, this.props.userSession);
        this.props.mutateUser();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  disableIfHasNotFinishedSettingUpAccount = () => {
    return !this.props.userSession.hasFinishedSettingUp;
  };

  reFocusWhenTransitionMenu = () => {
    if (this.prevOpenAccountMenu && !this.state.openAccountMenu) {
      this.accountAnchorRef.current.focus();
    }

    if (this.prevOpenGameMenu && !this.state.openGameMenu) {
      this.gameAnchorRef.current.focus();
    }

    this.prevOpenAccountMenu = this.state.openAccountMenu;
    this.prevOpenGameMenu = this.state.openGameMenu;
  };

  componentDidMount() {
    // console.log("mountAppBar");
    this.reFocusWhenTransitionMenu();
  }

  componentDidUpdate() {
    // console.log("updateAppBar");
    this.reFocusWhenTransitionMenu();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const userSessionKeys = ["email", "avatarUrl", "hasFinishedSettingUp"];
    const compareKeys = [
      "classes",
      ...userSessionKeys.map((key) => "userSession." + key),
    ];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    const { openAccountMenu, openGameMenu } = this.state;

    return (
      <AppBar position="fixed" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Grid className={classes.leftNavbarGrid}>
            <SearchFieldLayout />
          </Grid>
          <Grid className={classes.rightNavbarGrid}>
            <Button disableRipple className={classes.menuButton}>
              <Typography className={classes.menuButtonTitle}>
                Education
              </Typography>
            </Button>

            <Button disableRipple className={classes.menuButton}>
              <Typography className={classes.menuButtonTitle}>
                Notifications
              </Typography>
            </Button>

            <Button
              disableRipple
              disabled={openGameMenu}
              className={classes.menuButton}
              ref={this.gameAnchorRef}
              aria-controls={openGameMenu ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={this.toggleGameMenu}
            >
              <Typography className={classes.menuButtonTitle}>Game</Typography>
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
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper className={classes.menuPaper}>
                    <ClickAwayListener onClickAway={this.handleClose}>
                      <MenuList
                        autoFocusItem={openGameMenu}
                        id="menu-list-grow"
                        onKeyDown={this.handleListKeyDown}
                      >
                        <MenuItem disabled>Transactions</MenuItem>
                        <MenuItem
                          dense
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
                          onClick={() => {
                            redirectToPage("/transactionsHistory", this.props);
                          }}
                          className={classes.menuItem}
                        >
                          Trading History
                        </MenuItem>
                        <MenuItem
                          dense
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
                          className={classes.menuItem}
                        >
                          Pending Orders
                        </MenuItem>

                        <MenuItem disabled>List</MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            redirectToPage("/watchlist", this.props);
                          }}
                          className={classes.menuItem}
                        >
                          Watchlist
                        </MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            redirectToPage("/companies", this.props);
                          }}
                          className={classes.menuItem}
                        >
                          Companies
                        </MenuItem>

                        <MenuItem disabled>Explore</MenuItem>
                        <MenuItem dense className={classes.menuItem}>
                          Charts
                        </MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            redirectToPage("/ranking", this.props);
                          }}
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
                          className={classes.menuItem}
                        >
                          Ranking
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>

            <Button
              className={classes.menuButton}
              disabled={openAccountMenu}
              ref={this.accountAnchorRef}
              aria-label="Account Menu"
              aria-controls={openAccountMenu ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={this.toggleAccountMenu}
              disableRipple
            >
              <Typography className={classes.menuButtonTitle}>
                Account
              </Typography>
            </Button>
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
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper className={classes.menuPaper}>
                    <ClickAwayListener onClickAway={this.handleClose}>
                      <MenuList
                        autoFocusItem={openAccountMenu}
                        id="menu-list-grow"
                        onKeyDown={this.handleListKeyDown}
                      >
                        <MenuItem
                          className={classes.menuItem}
                          onClick={() => {
                            redirectToPage("/accountSummary", this.props);
                          }}
                        >
                          Account Summary
                        </MenuItem>
                        <MenuItem
                          className={classes.menuItem}
                          onClick={() => {
                            redirectToPage("/setting", this.props);
                          }}
                        >
                          Account Settings
                        </MenuItem>
                        <MenuItem
                          className={classes.menuItem}
                          onClick={this.logout}
                        >
                          Log Out
                        </MenuItem>
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
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: () => dispatch(userAction("logout")),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(PersistentAppBar)));
