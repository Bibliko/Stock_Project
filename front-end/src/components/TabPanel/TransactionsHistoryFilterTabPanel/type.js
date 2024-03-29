import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { withTranslation } from "react-i18next";

import {
  transactionTypeBuy,
  transactionTypeSell,
} from "../../../utils/low-dependency/PrismaConstantUtil";

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
    "&.MuiMenu-paper": {
      backgroundColor: theme.palette.paperBackground.onPageLight,
    },
  },
  select: {
    color: theme.palette.secondary.main,
    paddingLeft: "10px",
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    borderRadius: "4px",
    "&:focus": {
      backgroundColor: theme.palette.paperBackground.onPageSuperLight,
      borderRadius: "4px",
    },
  },
  menuItem: {
    "&:hover": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
    "&.MuiListItem-root": {
      "&.Mui-selected": {
        backgroundColor: theme.palette.menuItemHover.main,
      },
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
    const compareKeys = ["t", "classes", "filters"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { t, classes, filters } = this.props;

    const { open } = this.state;

    return (
      <React.Fragment>
        <Button className={classes.disableButton} disableRipple>
          {t("general.type")}
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
          <MenuItem value="none" className={classes.menuItem}>
            <em>None</em>
          </MenuItem>
          <MenuItem value={transactionTypeBuy} className={classes.menuItem}>
            {t("general." + transactionTypeBuy)}
          </MenuItem>
          <MenuItem value={transactionTypeSell} className={classes.menuItem}>
            {t("general." + transactionTypeSell)}
          </MenuItem>
        </Select>
      </React.Fragment>
    );
  }
}

export default withTranslation()(withStyles(styles)(withRouter(TypeFilter)));
