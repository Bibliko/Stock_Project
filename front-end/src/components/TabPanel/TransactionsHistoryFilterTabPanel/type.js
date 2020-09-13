import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";
import { Button, Select, MenuItem } from "@material-ui/core";

const styles = (theme) => ({
  disableButton: {
    color: "white",
    cursor: "unset",
    "&.MuiButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0)",
    },
  },
  mainSelect: {
    width: "100%",
    marginBottom: "5px",
  },
  select: {
    color: theme.palette.primary.main,
    paddingLeft: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    "&:focus": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "4px",
    },
  },
});

class TypeFilter extends React.Component {
  state = {
    open: false,
    type: "",
  };

  handleOpen = (event) => {
    this.setState({
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  handleChange = (event) => {
    this.setState({
      type: event.target.value,
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

    const { open, type } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          Type
        </Button>
        <Select
          open={open}
          onClose={this.handleClose}
          onOpen={this.handleOpen}
          value={type}
          onChange={this.handleChange}
          className={classes.mainSelect}
          classes={{
            select: classes.select,
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="Buy">Buy_Spend</MenuItem>
          <MenuItem value="Sell">Sell_Gain</MenuItem>
        </Select>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(TypeFilter));
