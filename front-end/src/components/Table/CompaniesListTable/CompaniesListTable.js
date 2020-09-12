import React from "react";

import { simplifyNumber } from "../../../utils/low-dependency/NumberUtil";

import Paper from "@material-ui/core/Paper";
import {
  CellMeasurerCache,
  SortDirection,
} from "react-virtualized";

import VirtualizedTable from "./VirtualizedTable";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === SortDirection.DESC
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

class CompaniesListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "id",
      sortDirection: SortDirection.ASC
    };

    this.tableCache = new CellMeasurerCache({
      fixedWidth: true,
      defaultWidth: 150,
      minHeight: 10,
    });

    //-----------------------PLACEHOLDER------------------------------//
    var sample = [
      // ["Name", "Code", "Price", "Market Cap", "Rating"],
      ["AaBbCc", "ABC", 676767676.12, 24, "S+"],
      ["DdEeFf", "DEF", 1234567891011.0, 37, "B"],
      ["GgHhIi", "GHI", 1212121.0, 24, "A-"]
    ];

    this.rows = [];

    for (let i = 0; i < 2000; i += 1) {
      const randomSelection = sample[Math.floor(Math.random() * sample.length)];
      this.rows.push(this.createData(i, ...randomSelection));
    }
    //----------------------------------------------------------------//
  }

  createData = (id, name, code, price, marketCap, rating) => {
    price = simplifyNumber(price);
    return { id, name, code, price, marketCap, rating };
  }

  handleSort = ({ sortDirection, sortBy }) => {
    this.rows = stableSort(this.rows, getComparator(sortDirection, sortBy));
    this.setState({
      sortBy: sortBy,
      sortDirection: sortDirection
    });
    this.resetTableCache();
  };

  resetTableCache = () => {
    this.tableCache.clearAll();
  }

  render() {
    const { sortBy, sortDirection } = this.state;
    const { handleOpenCompanyDetail, height } = this.props;
    return (
      <Paper style={{ height: `${height}px`, width: "100%", overflowX: "auto", overflowY: "hidden" }}>
        <VirtualizedTable
          minWidth={500}
          rowCount={this.rows.length}
          rowGetter={({ index }) => this.rows[index]}
          sortBy={sortBy}
          sortDirection={sortDirection}
          sort={this.handleSort}
          onCompanyClick={handleOpenCompanyDetail}
          flexGrow={1}
          cache={this.tableCache}
          resetCache={this.resetTableCache}
          columns={[
            {
              width: 100,
              minWidth: 30,
              label: "Name",
              dataKey: "name"
            },
            {
              width: 40,
              label: "Code",
              dataKey: "code"
            },
            {
              width: 40,
              label: "Price",
              dataKey: "price"
            },
            {
              width: 90,
              label: "Market Cap",
              dataKey: "marketCap"
            },
            {
              width: 40,
              label: "Rating",
              dataKey: "rating"
            }
          ]}
        />
      </Paper>
    );
  }
}

export default CompaniesListTable;
