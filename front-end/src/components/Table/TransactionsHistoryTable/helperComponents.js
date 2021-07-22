import React from "react";
import clsx from "clsx";

import {
  numberWithCommas,
  roundNumber,
} from "../../../utils/low-dependency/NumberUtil";
import { convertToLocalTimeString } from "../../../utils/low-dependency/DayTimeUtil";
import { transactionTypeBuy } from "../../../utils/low-dependency/PrismaConstantUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  TableCell,
  TableSortLabel,
  Typography,
  Paper,
  TablePagination,
} from "@material-ui/core";

import { AssignmentRounded as AssignmentRoundedIcon } from "@material-ui/icons";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.paperBackground.sub,
    color: "white",
  },
}))(TableCell);

export const chooseTableCellHeader = (
  indexInNamesState,
  createSortHandler,
  classes,
  state
) => {
  const { orderBy, orderQuery, names, prismaNames } = state;
  const label = names[indexInNamesState];
  const prismaType = prismaNames[indexInNamesState];

  return (
    <StyledTableCell
      key={indexInNamesState}
      align={label === "Type" ? "left" : "right"}
      className={clsx(classes.tableCell, {
        [classes.firstElementTopLeftRounded]: label === "Type",
        [classes.lastElementTopRightRounded]: label === "Transaction Time",
        [classes.tableCellTransactionTime]: label === "Transaction Time",
      })}
      sortDirection={orderBy === prismaType ? orderQuery : false}
    >
      <TableSortLabel
        active={orderBy === prismaType}
        direction={orderBy === prismaType ? orderQuery : "asc"}
        onClick={createSortHandler(prismaType)}
        className={classes.cellDiv}
        disabled={label === "Type"}
      >
        {label}
        {orderBy === prismaType ? (
          <span className={classes.visuallyHidden}>
            {orderQuery === "desc" ? "sorted descending" : "sorted ascending"}
          </span>
        ) : null}
      </TableSortLabel>
    </StyledTableCell>
  );
};

export const chooseTableCell = (
  label,
  isTableRowTheLast,
  classes,
  transactionInfo
) => {
  const { type, spendOrGain } = transactionInfo;

  return (
    <TableCell
      align="center"
      className={clsx(classes.tableCell, {
        [classes.lastRow]: isTableRowTheLast(),
        [classes.lastLeftCell]: isTableRowTheLast() && label === "Type",
        [classes.lastRightCell]:
          isTableRowTheLast() && label === "Transaction Time",
      })}
    >
      <div
        className={clsx(classes.cellDiv, {
          [classes.cellDivSpecialForType]: label === "Type",
        })}
      >
        <Typography
          className={clsx(classes.watchlistRowItem, {
            [classes.greenIcon]:
              (label === "Type" && type === transactionTypeBuy) ||
              (label === "Gain/Loss" && spendOrGain > 0),

            [classes.redIcon]:
              (label === "Type" && type !== transactionTypeBuy) ||
              (label === "Gain/Loss" && spendOrGain < 0),
          })}
          noWrap
        >
          {chooseTableCellValue(label, classes, transactionInfo)}
        </Typography>
      </div>
    </TableCell>
  );
};

export const chooseTableCellValue = (label, classes, transactionInfo) => {
  const {
    type,
    companyCode,
    quantity,
    priceAtTransaction,
    spendOrGain,
    finishedTime,
  } = transactionInfo;

  switch (label) {
    case "Type":
      return `${type}`;

    case "Code":
      return `${companyCode}`;

    case "Quantity":
      return `${numberWithCommas(quantity)}`;

    case "Price":
      return `$${numberWithCommas(roundNumber(priceAtTransaction, 2))}`;

    case "Gain/Loss":
      return type === transactionTypeBuy
        ? `- $${numberWithCommas(roundNumber(Math.abs(spendOrGain), 2))}`
        : `$${numberWithCommas(roundNumber(spendOrGain, 2))}`;

    case "Transaction Time":
      return convertToLocalTimeString(finishedTime);

    default:
      return;
  }
};

export const paperWhenHistoryEmpty = (
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
        Start by making some transactions by selling or buying stocks!
      </Typography>
    </Paper>
  );
};

export const tablePagination = (
  rowsLengthChoices,
  transactionsLength,
  rowsPerPage,
  pageBase0,
  handleChangePage,
  handleChangeRowsPerPage,
  classes
) => {
  return (
    <TablePagination
      classes={{
        selectIcon: classes.tablePaginationSelectIcon,
        actions: classes.tablePaginationActions,
      }}
      className={classes.tablePagination}
      rowsPerPageOptions={rowsLengthChoices}
      component="div"
      count={transactionsLength}
      rowsPerPage={rowsPerPage}
      page={pageBase0}
      onChangePage={handleChangePage}
      onChangeRowsPerPage={handleChangeRowsPerPage}
    />
  );
};

export default {
  chooseTableCellHeader,
  chooseTableCell,
  chooseTableCellValue,

  paperWhenHistoryEmpty,
  tablePagination,
};
