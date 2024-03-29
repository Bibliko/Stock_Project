import React from "react";
import { withRouter } from "react-router";

import { withTranslation } from "react-i18next";

import { TableRow } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { chooseTableCell } from "./helperComponents";

const styles = (theme) => ({
  tableCell: {
    color: "white",
    borderLeftWidth: "0px",
    borderRightWidth: "0px",
    borderTopWidth: "1px",
    borderBottomWidth: "0px",
    borderColor: theme.palette.secondary.main,
    borderStyle: "solid",
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  tableRow: {
    background: "transparent",
    backgroundColor: "transparent",
  },
  amendButton: {
    backgroundColor: theme.palette.success.main,
    "&:hover": {
      backgroundColor: `${theme.palette.success.mainHover} !important`,
    },
    marginRight: "8px"
  },
  deleteButton: {
    backgroundColor: theme.palette.fail.main,
    "&:hover": {
      backgroundColor: `${theme.palette.fail.mainHover} !important`,
    },
  },

  // border section
  lastLeftCell: {
    borderBottomLeftRadius: "4px",
  },
  lastRightCell: {
    borderBottomRightRadius: "4px",
  },
  lastRow: {
    borderBottomWidth: "1px",
  },
});

class PendingOrderTableRow extends React.Component {
  isLastRow = () => {
    const { rowIndex, rowsLength } = this.props;

    return rowIndex === rowsLength - 1;
  };

  render() {
    const {
      t,
      classes,
      labels,
      order,
      handleDelete,
      handleAmend,
    } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        { labels.map((label, index) => (
            chooseTableCell(
              t,
              label,
              index,
              this.isLastRow,
              classes,
              order,
              handleDelete,
              handleAmend,
            )
        ))}
      </TableRow>
    );
  }
}

export default withTranslation()(
  withStyles(styles)(withRouter(PendingOrderTableRow))
);