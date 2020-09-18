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
    marginBottom: theme.customMargin.dialogItemsTransactionsHistoryFilters,
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

/**
  Props: 
  filters={filters}
  handleChangeFilters={handleChangeFilters}
 */
class TypeFilter extends React.Component {
  state = {
    open: false,
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
    this.props.handleChangeFilters({
      ...this.props.filters,
      type: event.target.value === "" ? "none" : event.target.value,
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["filters"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const { classes, filters } = this.props;

    const { open } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          Type
        </Button>
        <Select
          open={open}
          onClose={this.handleClose}
          onOpen={this.handleOpen}
          value={isEqual(filters.type, "none") ? "" : filters.type}
          onChange={this.handleChange}
          className={classes.mainSelect}
          classes={{
            select: classes.select,
          }}
        >
          <MenuItem value="none">
            <em>None</em>
          </MenuItem>
          <MenuItem value="buy">Buy_Spend</MenuItem>
          <MenuItem value="sell">Sell_Gain</MenuItem>
        </Select>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(TypeFilter));
