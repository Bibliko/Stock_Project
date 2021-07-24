import React from "react";
import clsx from "clsx";

import {
  TableCell,
  Typography,
  Paper,
  Button,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { AssignmentRounded as AssignmentRoundedIcon } from "@material-ui/icons";

import { numberWithCommas, roundNumber, } from "../../../utils/low-dependency/NumberUtil";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.paperBackground.sub,
    color: "white",
  },
}))(TableCell);

export const chooseTableCellHeader = (indexColumnName, state) => {
  const { labels } = state;
  const label = labels[indexColumnName];

  return (
    <StyledTableCell key={indexColumnName} align={'center'}>{label}</StyledTableCell>
  );
};

export const chooseTableCell = (label, isLastRow, classes, order) => {
  return (
    <TableCell
      align="center"
      className={clsx(classes.tableCell, {
        [classes.lastRow]: isLastRow(),
        [classes.lastLeftCell]: isLastRow() && label === "Type",
        [classes.lastRightCell]:
        isLastRow() && label === "Actions",
      })}
    >
      <div>
        <Typography noWrap>
          {chooseTableCellValue(label, order, classes)}
        </Typography>
      </div>
    </TableCell>
  );
};

export const chooseTableCellValue = (label, order, classes) => {
  const {
    type,
    companyCode,
    quantity,
    option,
    limitPrice,
    brokerage,
  } = order;

  let tradeValue = numberWithCommas(roundNumber((limitPrice * quantity) + brokerage, 2));

  switch (label) {
    case "Type": return `${type}`;

    case "Code": return `${companyCode}`;

    case "Quantity": return `${numberWithCommas(quantity)}`;

    case "Option": return `${option}`;

    case "Land price": return `$${numberWithCommas(roundNumber(limitPrice, 2))}`;

    case "Brokerage": return `$${numberWithCommas(roundNumber(brokerage, 2))}`;

    case "Trade value": return `$${tradeValue}`;

    case "Actions":
      return (
        <span>
          <Button
            aria-label="amend"
            size="small"
            variant="contained"
            className={classes.amendButton}
            disableElevation
            onClick={() => alert('Amend')}
          >
            Amend
          </Button>
          <Button
            aria-label="delete"
            size="small"
            variant="contained"
            className={classes.deleteButton}
            disableElevation
            onClick={() => alert('Delete')}
          >
            Delete
          </Button>
        </span>
      );

    default: return;
  }
};

export const paperWhenPendingOrderEmpty = (
  classes,
  hoverPaperState,
  hoverPaperFn,
  notHoverPaper
) => {
  return (
    <Paper
      className={classes.emptyRowsPaper}
      onMouseEnter={hoverPaperFn}
      onMouseLeave={notHoverPaper}
    >
      <AssignmentRoundedIcon
        className={clsx(classes.assignmentIcon, {
          [classes.assignmentIconAnimation]: hoverPaperState,
        })}
      />
      <Typography className={classes.assignmentWord}>
        No pending orders!
      </Typography>
    </Paper>
  );
};

export default {
  chooseTableCellHeader,
  chooseTableCell,
  chooseTableCellValue,
  paperWhenPendingOrderEmpty,
};