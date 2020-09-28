import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { isEqual } from "lodash";

import { simplifyNumber } from "../../../utils/low-dependency/NumberUtil";

import { withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import {
  CellMeasurer,
  AutoSizer,
  Column,
  Table,
} from "react-virtualized";

const styles = (theme) => ({
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box"
  },
  table: {
    "& .ReactVirtualized__Table__headerRow": {
      flip: false,
      paddingRight: theme.direction === "rtl" ? "0 !important" : undefined
    }
  },
  tableHeader: {
    fontSize: "17px",
    fontWeight: "bold",
    textAlign: "left",
    padding: "0.5em",
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
    color: "white",
    "& .MuiTableSortLabel-active": {
      color: theme.palette.succeed.tableSorted,
      "& .MuiTableSortLabel-icon": {
        color: theme.palette.succeed.tableSortIcon + " !important",
      },
    },
    "& .MuiTableSortLabel-root:hover": {
      color: theme.palette.succeed.tableSorted,
    },
    "& .MuiTableSortLabel-icon": {
      color: theme.palette.succeed.tableSortIcon,
    },
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderRow: {
    borderBottom: "1px solid #9ED2EF",
    backgroundColor: theme.palette.tableHeader.main,
  },
  tableRow: {
    cursor: "pointer",
    borderBottom: "1px solid #9ED2EF",
    // background: theme.palette.tableBackground.gradient,
    backgroundColor: "transparent",
    color: "white",
    "&:hover": {
      color: "blue"
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
    paddingRight: "20%",
    textAlign: "center",
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

    return clsx(index === -1 ? classes.tableHeaderRow : classes.tableRow, classes.flexContainer);
  };

  cellRenderer = ({ cellData, dataKey, parent, rowIndex }) => {
    const { classes, cache } = this.props;
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}>
        <div
          className={clsx(classes.tableCell, {
            [classes.tableNormalCell]: dataKey !== "name",
            [classes.tableNameCell]: dataKey === "name",
          })}
          style={{
            whiteSpace: 'normal',
          }}
        >
          {dataKey === "marketCap" ? simplifyNumber(cellData) : cellData}
        </div>
      </CellMeasurer>
    );
  };

  headerRenderer = ({ label, columnIndex, dataKey }) => {
    const { headerHeight, sortBy, sortDirection, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.tableHeader)}
        variant="head"
        style={{ height: headerHeight }}
        sortDirection={sortBy === dataKey ? sortDirection.toLowerCase() : false}
      >
        <TableSortLabel
          active={sortBy === dataKey}
          direction={sortBy === dataKey ? sortDirection.toLowerCase() : "asc"}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.rows, this.props.rows) ||
      nextProps.sortBy !== this.props.sortBy ||
      nextProps.sortDirection !== this.props.sortDirection ||
      !isEqual(nextProps.cache, this.props.cache)
    );
  }

  componentDidUpdate() {
    const {
      width,
      resetCache,
    } = this.props;

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
              direction: "inherit"
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
                      dataKey: dataKey
                    })
                  }
                  className={clsx(classes.flexContainer, classes.tableColumn)}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  flexGrow={1}
                  minWidth={40}
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
      numeric: PropTypes.bool,
      width: PropTypes.number.isRequired
    })
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number
};

export default withStyles(styles)(VirtualizedTable);
