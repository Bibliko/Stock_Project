import React from "react";
import { withRouter } from "react-router";

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
    const { classes, labels, order } = this.props;

    return (
      <TableRow className={classes.tableRow}>
        { labels.map((label) => (
            chooseTableCell(
              label,
              this.isLastRow,
              classes,
              order
            )
        ))}
      </TableRow>
    );
  }
}

export default withStyles(styles)(withRouter(PendingOrderTableRow));