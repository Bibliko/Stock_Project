import React from "react";

import { changeOpacityOfRGBAString } from "../../theme/ThemeUtil";

import { withStyles } from "@material-ui/core/styles";

import { IconButton, Avatar as MuiAvatar } from "@material-ui/core";

import { EditRounded as EditRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  avatar: {
    height: "150px",
    width: "150px",
    [theme.breakpoints.down("md")]: {
      height: "128px",
      width: "128px",
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
  editDiv: {
    position: "absolute",
    backgroundColor: changeOpacityOfRGBAString(
      theme.palette.primary.subDarker,
      "0.3"
    ),
    borderRadius: "50%",
    width: "100%",
    height: "100%",
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
        disableRipple
      >
        <MuiAvatar src={avatarUrl} className={classes.avatar} />
        {hover && (
          <div className={classes.editDiv}>
            <EditRoundedIcon className={classes.editIcon} />
          </div>
        )}
      </IconButton>
    );
  }
}

export default withStyles(styles)(Avatar);
