import React from "react";
import clsx from "clsx";

import { withStyles } from "@material-ui/core/styles";

import IconButton from "@material-ui/core/IconButton";
import MuiAvatar from "@material-ui/core/Avatar";

import EditRoundedIcon from "@material-ui/icons/EditRounded";
import { isEqual } from "lodash";

const styles = (theme) => ({
  avatar: {
    height: "200px",
    width: "200px",
    [theme.breakpoints.down("md")]: {
      height: "128px",
      width: "128px",
    },
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    color: theme.palette.appBarBlue.main,
  },
  avatarButton: {
    position: "relative",
    padding: "0px",
  },
  editIcon: {
    color: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  hoverAvatarColor: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});

class Avatar extends React.Component {
  state = {
    hover: false,
  };

  hoverOn = () => {
    this.setState({
      hover: true,
    });
  };

  hoverOff = () => {
    this.setState({
      hover: false,
    });
  };

  render() {
    const { classes, avatarUrl, handleClick } = this.props;
    const { hover } = this.state;

    return (
      <IconButton
        onClick={handleClick}
        onMouseEnter={this.hoverOn}
        onMouseLeave={this.hoverOff}
        className={classes.avatarButton}
      >
        <MuiAvatar
          src={avatarUrl}
          className={clsx(classes.avatar, {
            [classes.hoverAvatarColor]: hover,
          })}
        />
        {hover && <EditRoundedIcon className={classes.editIcon} />}
      </IconButton>
    );
  }
}

export default withStyles(styles)(Avatar);
