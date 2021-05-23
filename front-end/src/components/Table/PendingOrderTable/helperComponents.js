import React from "react";
import clsx from "clsx";

import {
  TableCell,
  Typography,
  Paper,
  TablePagination,
  Button,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { AssignmentRounded as AssignmentRoundedIcon } from "@material-ui/icons";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.paperBackground.sub,
    color: "white",
  },
}))(TableCell);

export const chooseTableCellHeader = (indexColumnName, state) => {
  const { names } = state;
  const type = names[indexColumnName];

  return (
    <StyledTableCell key={indexColumnName} align={'center'}>{type}</StyledTableCell>
  );
};

export const chooseTableCell = (type, isLastRow, classes, order) => {
  return (
    <TableCell
      align="center"
      className={clsx(classes.tableCell, {
        [classes.lastRow]: isLastRow(),
        [classes.lastLeftCell]: isLastRow() && type === "Type",
        [classes.lastRightCell]:
        isLastRow() && type === "Actions",
      })}
    >
      <div>
        <Typography noWrap>
          {chooseTableCellValue(type, order, classes)}
        </Typography>
      </div>
    </TableCell>
  );
};

export const chooseTableCellValue = (type, order, classes) => {
  const {
    isTypeBuy,
    companyCode,
    quantity,
    option,
    limitPrice,
    brokerage,
    tradeValue,
  } = order;

  //TODO: change to correct display type
  switch (type) {
    case "Type": return isTypeBuy ? "BUY" : "SELL";

    case "Code": return `${companyCode}`;

    case "Quantity": return `${quantity}`;

    case "Option": return `${option}`;

    case "Land price": return `${limitPrice}`;

    case "Brokerage": return `${brokerage}`;

    case "Trade value": return `${tradeValue}`;

    case "Actions":
      return <span>
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
      </span>;

    default: return;
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
        TODO: add message empty data here
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
