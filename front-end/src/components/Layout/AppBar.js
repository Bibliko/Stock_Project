import React, { createRef } from "react";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { redirectToPage } from "../../utils/PageRedirectUtil";
import { logoutUser } from "../../utils/UserUtil";

import SearchFieldLayout from "../Search/SearchFieldLayout";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import VideogameAssetRoundedIcon from "@material-ui/icons/VideogameAssetRounded";
import MenuBookRoundedIcon from "@material-ui/icons/MenuBookRounded";
import InfoRoundedIcon from "@material-ui/icons/InfoRounded";

const styles = (theme) => ({
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: theme.palette.appBarBlue.main,
    height: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      height: theme.customHeight.appBarHeightSmall,
    },
  },
  menuButton: {
    height: "fit-content",
    width: "fit-content",
    padding: 0,
    marginRight: "6px",
    "& .MuiIconButton-colorPrimary": {
      color: "white",
    },
  },
  secondaryMenuButton: {
    height: "fit-content",
    width: "fit-content",
    padding: 0,
    margin: "6px",
    "& .MuiIconButton-colorPrimary": {
      color: "white",
    },
  },
  avatarIcon: {
    height: "35px",
    width: "35px",
    [theme.breakpoints.down("xs")]: {
      height: "25px",
      width: "25px",
    },
    color: "white",
    "&:hover": {
      background: theme.palette.paperBackground.gradient,
      borderRadius: "50%",
    },
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
  },
  menuPaper: {
    backgroundColor: theme.palette.menuBackground.main,
    color: "white",
    minWidth: "160px",
  },
  endMenuItem: {
    marginBottom: "5px",
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
    this.reFocusWhenTransitionMenu();
  }

  componentDidUpdate() {
    this.reFocusWhenTransitionMenu();
  }

  render() {
    const { classes, userSession } = this.props;

    const { openAccountMenu, openGameMenu } = this.state;

    return (
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Grid className={classes.leftNavbarGrid}>
            <SearchFieldLayout />
          </Grid>
          <Grid className={classes.rightNavbarGrid}>
            <IconButton
              title="Game"
              className={classes.secondaryMenuButton}
              ref={this.gameAnchorRef}
              aria-controls={openGameMenu ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={this.toggleGameMenu}
              disableRipple
            >
              <VideogameAssetRoundedIcon className={classes.avatarIcon} />
            </IconButton>
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
                        >
                          Buy Stocks
                        </MenuItem>
                        <MenuItem
                          dense
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
                        >
                          Trading History
                        </MenuItem>
                        <MenuItem
                          dense
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
                          className={classes.endMenuItem}
                        >
                          Pending Orders
                        </MenuItem>

                        <MenuItem disabled>List</MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            redirectToPage("/watchlist", this.props);
                          }}
                        >
                          Watchlist
                        </MenuItem>
                        <MenuItem dense>Companies</MenuItem>

                        <MenuItem disabled>Explore</MenuItem>
                        <MenuItem dense>Charts</MenuItem>
                        <MenuItem
                          dense
                          onClick={() => {
                            redirectToPage("/ranking", this.props);
                          }}
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
                        >
                          Ranking
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
            <IconButton
              title="Education"
              className={classes.secondaryMenuButton}
              disableRipple
            >
              <MenuBookRoundedIcon className={classes.avatarIcon} />
            </IconButton>
            <IconButton
              title="About Us"
              className={classes.secondaryMenuButton}
              disableRipple
            >
              <InfoRoundedIcon className={classes.avatarIcon} />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              ref={this.accountAnchorRef}
              aria-label="Account Menu"
              aria-controls={openAccountMenu ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={this.toggleAccountMenu}
              disableRipple
            >
              {isEmpty(userSession.avatarUrl) ? (
                <AccountCircleRoundedIcon className={classes.avatarIcon} />
              ) : (
                <Avatar
                  className={classes.avatarIcon}
                  src={userSession.avatarUrl}
                />
              )}
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
                        <MenuItem>Account Settings</MenuItem>
                        <MenuItem
                          onClick={() => {
                            redirectToPage("/accountSummary", this.props);
                          }}
                          disabled={this.disableIfHasNotFinishedSettingUpAccount()}
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
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: () => dispatch(userAction("logout")),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(PersistentAppBar)));
