import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { isEqual, pick } from "lodash";

import { simplifyNumber } from "../../../utils/low-dependency/NumberUtil";

import { withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import { CellMeasurer, AutoSizer, Column, Table } from "react-virtualized";

const styles = (theme) => ({
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
  table: {
    "& .ReactVirtualized__Table__headerRow": {
      flip: false,
      paddingRight: theme.direction === "rtl" ? "0 !important" : undefined,
    },
  },
  sortLabel: {
    color: `${theme.palette.normalFontColor.primary} !important`,
  },
  tableHeader: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    fontWeight: "bold",
    padding: "0.5em",
    paddingRight: "1em",
    color: `${theme.palette.normalFontColor.primary}`,
    "& .MuiTableSortLabel-root:hover": {
      color: `${theme.palette.normalFontColor.primary}`,
      fontStyle: "italic",
    },
    "& .MuiTableSortLabel-root:focus": {
      color: `${theme.palette.normalFontColor.primary}`,
      fontStyle: "italic",
    },
    "& .MuiTableSortLabel-active": {
      color: `${theme.palette.normalFontColor.primary} !important`,
      fontStyle: "italic",
      "& .MuiTableSortLabel-icon": {
        color: `${theme.palette.normalFontColor.primary} !important`,
      },
    },
    "& .MuiTableSortLabel-icon": {
      color: `${theme.palette.normalFontColor.primary}`,
    },
    alignItems: "center",
  },
  tableHeaderHover: {
    "&:hover": {
      color: `${theme.palette.normalFontColor.primary} !important`,
    },
  },
  tableHeaderRow: {
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
    backgroundColor: theme.palette.paperBackground.sub,
  },
  tableRow: {
    cursor: "pointer",
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
    backgroundColor: "transparent",
    color: `${theme.palette.normalFontColor.primary}`,
    "&:hover": {
      color: theme.palette.secondary.main,
    },
  },
  tableNameCell: {
    padding: "0.5em",
    textAlign: "left",
    fontSize: "15px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
    flexDirection: "column",
    alignItems: "initial",
  },
  tableNormalCell: {
    paddingRight: "1em",
    textAlign: "right",
    fontSize: "15px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
    flexDirection: "column",
    alignItems: "initial",
  },
  tableCell: {
    flex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
});

class VirtualizedTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    // Use ref to force update table
    this.tableRef = React.createRef();
    this._lastRenderedWidth = this.props.width;
  }

  static defaultProps = {
    headerHeight: 48,
  };

  getRowClassName = ({ index }) => {
    const { classes } = this.props;

    return clsx(
      index === -1 ? classes.tableHeaderRow : classes.tableRow,
      classes.flexContainer
    );
  };

  innerCellRenderer = ({ cellData, dataKey, ...other }) => {
    const { classes } = this.props;
    return (
      <div
        className={clsx(classes.tableCell, {
          [classes.tableNormalCell]: dataKey !== "name",
          [classes.tableNameCell]: dataKey === "name",
        })}
        style={{
          whiteSpace: "normal",
        }}
        {...other}
      >
        {dataKey === "marketCap" ? simplifyNumber(cellData) : cellData}
      </div>
    );
  };

  cellRenderer = ({ cellData, dataKey, parent, rowIndex }) => {
    const { cache } = this.props;
    return dataKey === "name" ? (
      <CellMeasurer
        cache={cache}
        columnIndex={1}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}
      >
        {this.innerCellRenderer({ cellData, dataKey })}
      </CellMeasurer>
    ) : (
      this.innerCellRenderer({
        cellData,
        dataKey,
        key: dataKey,
        parent,
      })
    );
  };

  headerRenderer = ({ label, columnIndex, dataKey }) => {
    const { headerHeight, sortBy, sortDirection, classes } = this.props;

    return (
      <TableCell
        align={dataKey === "name" ? "left" : "right"}
        className={clsx(
          {
            [classes.sortLabel]: sortBy === dataKey,
            [classes.tableHeaderHover]: dataKey !== "index",
          },
          classes.tableCell,
          classes.flexContainer,
          classes.tableHeader
        )}
        style={{ height: headerHeight }}
        sortDirection={sortBy === dataKey ? sortDirection.toLowerCase() : false}
      >
        {dataKey !== "index" ? (
          <TableSortLabel
            active={sortBy === dataKey}
            direction={sortBy === dataKey ? sortDirection.toLowerCase() : "asc"}
          >
            {label}
            {sortBy === dataKey ? (
              <span className={classes.visuallyHidden}>
                {sortDirection.toLowerCase() === "desc"
                  ? "sorted descending"
                  : "sorted ascending"}
              </span>
            ) : null}
          </TableSortLabel>
        ) : (
          label
        )}
      </TableCell>
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "rows", "sortBy", "sortDirection", "cache"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return !isEqual(nextPropsCompare, propsCompare);
  }

  componentDidUpdate() {
    const { width, resetCache } = this.props;

    this.tableRef.current.forceUpdateGrid();
    if (this._lastRenderedWidth !== width) {
      this._lastRenderedWidth = width;
      resetCache();
    }
  }

  componentDidMount() {
    if (this._lastRenderedWidth !== this.props.width) {
      this._lastRenderedWidth = this.props.width;
      this.props.resetCache();
    }
  }

  render() {
    const {
      classes,
      columns,
      rowHeight,
      headerHeight,
      sortBy,
      sortDirection,
      cache,
      minWidth,
      resetCache,
      tableRef,
      ...tableProps
    } = this.props;

    return (
      <AutoSizer onResize={resetCache}>
        {({ height, width }) => (
          <Table
            ref={this.tableRef}
            height={height}
            width={Math.max(width, minWidth)}
            rowHeight={cache.rowHeight}
            gridStyle={{
              direction: "inherit",
            }}
            headerHeight={headerHeight}
            className={classes.table}
            sortBy={sortBy}
            sortDirection={sortDirection}
            rowClassName={this.getRowClassName}
            overscanRowCount={2}
            {...tableProps}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                      dataKey: dataKey,
                    })
                  }
                  className={clsx(classes.flexContainer, classes.tableColumn)}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  flexGrow={1}
                  {...other}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

VirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      minWidth: PropTypes.number,
      maxWidth: PropTypes.number,
    })
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

export default withStyles(styles)(VirtualizedTable);
