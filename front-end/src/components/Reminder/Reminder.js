import React from "react";
import { withRouter } from "react-router";
import { isUndefined, isEqual, pick } from "lodash";
import { connect } from "react-redux";

import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { Typography, Link, IconButton } from "@material-ui/core";

import { CloseRounded as CloseRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  reminder: {
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    width: "80%",
    height: "40px",
    padding: "10px",
    backgroundColor: theme.palette.primary.subDark,
    boxShadow: theme.customShadow.popup,
    zIndex: theme.customZIndex.reminder,
    bottom: "15px",
    left: "10%",
    transition: "top 1s",
    borderRadius: "5px",
  },
  reminderText: {
    fontSize: "small",
    [theme.breakpoints.down("xs")]: {
      fontSize: "x-small",
    },
  },
  reminderLink: {
    "&:hover": {
      cursor: "pointer",
    },
    marginLeft: "5px",
    marginRight: "5px",
    color: "white",
    textDecoration: "underline",
  },
  closeButton: {
    position: "absolute",
    right: "8px",
    maxHeight: "20px",
    maxWidth: "20px",
    padding: "0px",
  },
  closeIcon: {
    maxHeight: "20px",
    maxWidth: "20px",
    color: "white",
  },
});

class Reminder extends React.Component {
  state = {
    hide: false,
  };

  clickAccountSettings = (event) => {
    event.preventDefault();
    redirectToPage("/setting", this.props);
  };

  hideReminder = () => {
    this.setState({
      hide: true,
    });
  };

  settingAccountComponent = (classes, preventDefault) => {
    return (
      <Typography className={classes.reminderText}>
        You haven't finished setting up your account. Get started now!
        <Link
          onClick={this.clickAccountSettings}
          className={classes.reminderLink}
        >
          Account Settings
        </Link>
      </Typography>
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    const userSessionKeys = ["email", "hasFinishedSettingUp"];
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
    const { classes, userSession } = this.props;

    return (
      (userSession.hasFinishedSettingUp && this.state.hide) &&
      <div className={classes.reminder}>
        {!isUndefined(userSession.hasFinishedSettingUp) &&
          !userSession.hasFinishedSettingUp &&
          this.settingAccountComponent(classes, this.preventDefault)}
        <IconButton className={classes.closeButton} onClick={this.hideReminder}>
          <CloseRoundedIcon className={classes.closeIcon} />
        </IconButton>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(
  mapStateToProps,
  null
)(withStyles(styles)(withRouter(Reminder)));
