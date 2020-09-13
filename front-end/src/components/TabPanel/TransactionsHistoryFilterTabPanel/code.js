import React from "react";
import clsx from "clsx";
import { isEqual, isEmpty, pick } from "lodash";
import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { ClearRounded as ClearRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  disableButton: {
    color: "white",
    cursor: "unset",
    "&.MuiButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0)",
    },
  },
  mainTextField: {
    width: "100%",
    marginBottom: "10px",
  },
  inputBase: {
    color: "white",
    borderRadius: "4px",
    paddingLeft: "10px",
    paddingRight: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&:focus": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  iconButton: {
    color: "rgba(255, 255, 255, 0.7)",
    "&.MuiIconButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0)",
    },
  },
  hide: {
    display: "none",
  },
});

class CodeFilter extends React.Component {
  state = {
    codeFilterQuery: "",
  };

  handleChange = (event) => {
    this.setState({
      codeFilterQuery: event.target.value,
    });
  };

  clearCodeFilterQuery = () => {
    this.setState({
      codeFilterQuery: "",
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = [];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const { classes } = this.props;

    const { codeFilterQuery } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          Code
        </Button>
        <TextField
          onChange={this.handleChange}
          value={codeFilterQuery}
          className={classes.mainTextField}
          InputProps={{
            className: classes.inputBase,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disableRipple
                  edge="end"
                  className={clsx(classes.iconButton, {
                    [classes.hide]: isEmpty(codeFilterQuery),
                  })}
                  onClick={this.clearCodeFilterQuery}
                >
                  <ClearRoundedIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(CodeFilter));
