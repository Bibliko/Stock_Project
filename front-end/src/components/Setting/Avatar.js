import React from "react";

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
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
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

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState.hover, this.state.hover)) {
      return true;
    }
    return false;
  }

  render() {
    const { classes, avatarUrl, handleClick } = this.props;
    const { hover } = this.state;

    return (
      <IconButton onClick={handleClick} className={classes.avatarButton}>
        <MuiAvatar
          src={avatarUrl}
          onMouseEnter={this.hoverOn}
          onMouseLeave={this.hoverOff}
          className={classes.avatar}
        />
        {hover && (
          <EditRoundedIcon
            className={classes.editIcon}
            onMouseEnter={this.hoverOn}
            onMouseLeave={this.hoverOff}
          />
        )}
      </IconButton>
    );
  }
}

export default withStyles(styles)(Avatar);
