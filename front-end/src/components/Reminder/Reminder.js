import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";
import { isUndefined } from "lodash";
import { connect } from "react-redux";

import { redirectToPage } from "../../utils/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";

import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

const styles = (theme) => ({
  reminder: {
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    width: "100%",
    height: "40px",
    padding: "10px",
    backgroundColor: "#e23d3d",
    zIndex: theme.customZIndex.reminder,
    top: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      top: theme.customHeight.appBarHeightSmall,
    },
    transition: "top 1s",
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
  hide: {
    top: "-40px",
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

  componentDidMount() {
    // console.log("mountReminder");
  }

  componentDidUpdate() {
    // console.log("updateReminder");
  }

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

  render() {
    const { classes, userSession } = this.props;

    return (
      <div
        className={clsx(classes.reminder, {
          [classes.hide]: userSession.hasFinishedSettingUp || this.state.hide,
        })}
      >
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
