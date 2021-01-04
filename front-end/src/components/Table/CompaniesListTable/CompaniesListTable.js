import React from "react";
import { isEqual } from "lodash";

import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { CellMeasurerCache } from "react-virtualized";

import VirtualizedTable from "./VirtualizedTable";

const styles = (theme) => ({
  paper: {
    background: theme.palette.paperBackground.onPage,
    overflowX: "auto",
    overflowY: "hidden",
  },
});

class CompaniesListTable extends React.Component {
  constructor(props) {
    super(props);

    this.tableCache = new CellMeasurerCache({
      fixedWidth: true,
      defaultWidth: 150,
      minHeight: 10,
    });
  }

  handleSort = ({ sortDirection, sortBy }) => {
    const { handleSort } = this.props;
    handleSort(sortDirection, sortBy);
    this.resetTableCache();
  };

  resetTableCache = () => {
    this.tableCache.clearAll();
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.rows, this.props.rows) ||
      nextProps.sortBy !== this.props.sortBy ||
      nextProps.sortDirection !== this.props.sortDirection
    );
  }

  componentDidUpdate() {
    this.resetTableCache();
  }

  render() {
    const {
      classes,
      sortBy,
      sortDirection,
      rows,
      handleOpenCompanyDetail,
      height,
    } = this.props;

    return (
      <Paper
        className={classes.paper}
        style={{ height: `${height}px`, width: "100%" }}
      >
        <VirtualizedTable
          rows={rows}
          minWidth={500}
          rowCount={rows.length}
          rowGetter={({ index }) => rows[index]}
          sortBy={sortBy}
          sortDirection={sortDirection}
          sort={this.handleSort}
          onRowClick={handleOpenCompanyDetail}
          flexGrow={1}
          cache={this.tableCache}
          resetCache={this.resetTableCache}
          columns={[
            {
              width: 50,
              minWidth: 50,
              maxWidth: 50,
              label: "No.",
              dataKey: "index",
            },
            {
              width: 100,
              minWidth: 60,
              label: "Name",
              dataKey: "name",
            },
            {
              width: 60,
              minWidth: 40,
              label: "Code",
              dataKey: "code",
            },
            {
              width: 60,
              minWidth: 40,
              label: "Price",
              dataKey: "price",
            },
            {
              width: 120,
              minWidth: 60,
              label: "Market Cap",
              dataKey: "marketCap",
            },
            {
              width: 80,
              minWidth: 60,
              label: "Rating",
              dataKey: "rating",
            },
          ]}
        />
      </Paper>
    );
  }
}

export default withStyles(styles)(CompaniesListTable);
