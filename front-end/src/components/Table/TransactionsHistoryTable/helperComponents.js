import React from "react";
import clsx from "clsx";

import {
  numberWithCommas,
  roundNumber,
} from "../../../utils/low-dependency/NumberUtil";
import { convertToLocalTimeString } from "../../../utils/low-dependency/DayTimeUtil";

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
  const type = names[indexInNamesState];
  const prismaType = prismaNames[indexInNamesState];

  return (
    <StyledTableCell
      key={indexInNamesState}
      align={type === "Type" ? "left" : "right"}
      className={clsx(classes.tableCell, {
        [classes.firstElementTopLeftRounded]: type === "Type",
        [classes.lastElementTopRightRounded]: type === "Transaction Time",
        [classes.tableCellTransactionTime]: type === "Transaction Time",
      })}
      sortDirection={orderBy === prismaType ? orderQuery : false}
    >
      <TableSortLabel
        active={orderBy === prismaType}
        direction={orderBy === prismaType ? orderQuery : "asc"}
        onClick={createSortHandler(prismaType)}
        className={classes.cellDiv}
        disabled={type === "Type"}
      >
        {type}
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
  type,
  isTableRowTheLast,
  classes,
  transactionInfo
) => {
  const { isTypeBuy, spendOrGain } = transactionInfo;

  return (
    <TableCell
      align="center"
      className={clsx(classes.tableCell, {
        [classes.lastRow]: isTableRowTheLast(),
        [classes.lastLeftCell]: isTableRowTheLast() && type === "Type",
        [classes.lastRightCell]:
          isTableRowTheLast() && type === "Transaction Time",
      })}
    >
      <div
        className={clsx(classes.cellDiv, {
          [classes.cellDivSpecialForType]: type === "Type",
        })}
      >
        <Typography
          className={clsx(classes.watchlistRowItem, {
            [classes.greenIcon]:
              (type === "Type" && isTypeBuy) ||
              (type === "Gain/Loss" && spendOrGain > 0),

            [classes.redIcon]:
              (type === "Type" && !isTypeBuy) ||
              (type === "Gain/Loss" && spendOrGain < 0),
          })}
          noWrap
        >
          {chooseTableCellValue(type, classes, transactionInfo)}
        </Typography>
      </div>
    </TableCell>
  );
};

export const chooseTableCellValue = (type, classes, transactionInfo) => {
  const {
    isTypeBuy,
    companyCode,
    quantity,
    priceAtTransaction,
    spendOrGain,
    finishedTime,
  } = transactionInfo;

  switch (type) {
    case "Type":
      return isTypeBuy ? "Buy" : "Sell";

    case "Code":
      return `${companyCode}`;

    case "Quantity":
      return `${numberWithCommas(quantity)}`;

    case "Price":
      return `$${numberWithCommas(roundNumber(priceAtTransaction, 2))}`;

    case "Gain/Loss":
      return isTypeBuy
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
