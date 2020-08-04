import React, { createRef } from "react";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import WatchlistTableContainer from "../../components/Table/WatchlistTable/WatchlistTableContainer";
import InputTextFieldWithDeleteButton from "../../components/TextField/inputTextFieldWithDeleteButton";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Paper from "@material-ui/core/Paper";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: "100px",
    [theme.breakpoints.down("xs")]: {
      width: "85%",
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: "none",
  },
  fullWidth: {
    width: "100%",
    minHeight: "200px",
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  watchlistStartingText: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
  },
  companiesText: {
    color: "#9C8CF9",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    fontWeight: "bold",
  },
  menuPaper: {
    backgroundColor: theme.palette.menuBackground.main,
    color: "white",
    minWidth: "160px",
  },
  popperSearch: {
    maxWidth: "100%",
  },
});

class WatchlistPage extends React.Component {
  watchlistAnchorRef = createRef(null);
  prevOpenWatchlistSearchMenu = false;

  state = {
    openWatchlistSearchMenu: false,
    searchCompany: "",
  };

  changeSearchCompany = (event) => {
    this.setState({
      searchCompany: event.target.value,
    });
    if (isEmpty(event.target.value) && this.state.openWatchlistSearchMenu) {
      this.setState({
        openWatchlistSearchMenu: false,
      });
    }
    if (!isEmpty(event.target.value) && !this.state.openWatchlistSearchMenu) {
      this.setState({
        openWatchlistSearchMenu: true,
      });
    }
  };

  clearSearchCompany = () => {
    this.setState({
      searchCompany: "",
    });
  };

  handleClose = (event) => {
    this.setState({
      openWatchlistSearchMenu: false,
    });
  };

  handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      this.setState({
        openWatchlistSearchMenu: false,
      });
    }
  };

  toggleWatchlistSearchMenu = () => {
    this.setState({
      openWatchlistSearchMenu: true,
    });
  };

  componentDidMount() {
    console.log(this.props.userSession);
  }

  render() {
    const { classes, userSession } = this.props;
    const { openWatchlistSearchMenu } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid container className={classes.fullWidth}>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={classes.companiesText}>
              Companies:
            </Typography>
            <InputTextFieldWithDeleteButton
              name="Search"
              ref={this.watchlistAnchorRef}
              changeData={this.changeSearchCompany}
              clearData={this.clearSearchCompany}
            />
            <Popper
              open={openWatchlistSearchMenu}
              anchorEl={this.watchlistAnchorRef.current}
              placement="bottom-start"
              className={classes.popperSearch}
              transition
            >
              {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps}>
                  <Paper className={classes.menuPaper}>
                    <ClickAwayListener onClickAway={this.handleClose}>
                      <MenuList
                        //autoFocusItem={openWatchlistSearchMenu}
                        id="menu-list-grow"
                        onKeyDown={this.handleListKeyDown}
                      >
                        <MenuItem>{this.state.searchCompany}</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            {isEmpty(userSession.watchlist) && (
              <Typography className={classes.watchlistStartingText}>
                Start by adding companies to your watchlist!
              </Typography>
            )}
            {!isEmpty(userSession.watchlist) && (
              <WatchlistTableContainer rows={userSession.watchlist} />
            )}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(WatchlistPage))
);
