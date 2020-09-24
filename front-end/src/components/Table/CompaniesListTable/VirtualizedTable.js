import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import {
  CellMeasurer,
  AutoSizer,
  Column,
  Table,
  SortIndicator
} from "react-virtualized";

const styles = (theme) => ({
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box"
  },
  table: {
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    "& .ReactVirtualized__Table__headerRow": {
      flip: false,
      paddingRight: theme.direction === "rtl" ? "0 !important" : undefined
    }
  },
  tableHeader: {
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "left",
    padding: "0.5em",
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
    },
  },
  tableHeaderRow: {
    backgroundColor: theme.palette.tableHeader.main,
  },
  tableRow: {
    cursor: "pointer",
    borderBottom: "1px solid #9ED2EF",
  },
  tableNameCell: {
    "&:hover": {
      color: "blue"
    },
    padding: "0.5em",
    textAlign: "left",
    fontSize: "15px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
  },
  tableNormalCell: {
    paddingLeft: "0.4em",
    textAlign: "center",
    fontSize: "15px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px",
    },
  },
  tableCell: {
    flex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  noClick: {
    cursor: "initial"
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
    width: 1
  }
});

class VirtualizedTable extends React.Component {
  constructor(props, context) {
    super(props, context);
  
    this._lastRenderedWidth = this.props.width;
  }

  static defaultProps = {
    headerHeight: 48,
  };

  getRowClassName = ({ index }) => {
    const { classes } = this.props;

    return clsx(index === -1 && classes.tableHeaderRow, classes.tableRow, classes.flexContainer);
  };

  cellRenderer = ({ cellData, dataKey, parent, columnIndex, rowIndex }) => {
    const { classes, cache, onCompanyClick } = this.props;
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}>
        <div
          className={clsx(classes.tableCell, {
            [clsx(classes.noClick, classes.tableNormalCell)]: columnIndex !== 0,
            [classes.tableNameCell]: columnIndex === 0
          })}
          style={{
            whiteSpace: 'normal',
          }}
          onClick={columnIndex === 0 ? () => onCompanyClick(cellData) : ()=>{}}
        >
          {cellData}
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
        {columnIndex > -1 ? (
          <TableSortLabel
            active={sortBy === dataKey}
            direction={sortBy === dataKey ? sortDirection.toLowerCase() : "asc"}
          >
            {label}
          </TableSortLabel>
        ) : (
          <React.Fragment>
            <span> {label} </span>
            {sortBy === dataKey && (
              <SortIndicator sortDirection={sortDirection} />
            )}
          </React.Fragment>
        )}
      </TableCell>
    );
  };

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
      ...tableProps
    } = this.props;
    if (this._lastRenderedWidth !== this.props.width) {
      this._lastRenderedWidth = this.props.width;
      cache.clearAll();
    }
    return (
      <AutoSizer onResize={resetCache}>
        {({ height, width }) => (
          <Table
            height={height}
            width={Math.max(width, minWidth)}
            // rowHeight={rowHeight}
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
