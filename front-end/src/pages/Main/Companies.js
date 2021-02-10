import React from "react";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";
import { getStockScreener } from "../../utils/FinancialModelingPrepUtil";
import { getAllCompaniesRating } from "../../utils/CompanyUtil";

import { SortDirection } from "react-virtualized";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid, Typography } from "@material-ui/core";

import CompanyDialog from "../../components/CompanyDetail/CompanyDialog";
import CompaniesListTable from "../../components/Table/CompaniesListTable/CompaniesListTable";
import Filter from "../../components/StockScreener/Filter";
import ProgressButton from "../../components/Button/ProgressButton";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    marginBottom: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
      marginBottom: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    maxWidth: "none",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: "0px",
    },
  },
  itemGrid: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
  },
  gridTitle: {
    fontSize: "x-large",
    fontWeight: "bold",
    marginBottom: "10px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
      marginTop: "20px",
    },
    color: theme.palette.primary.main,
  },
  caption: {
    font: "caption",
    fontSize: "small",
    color: "white",
    margin: "20px",
  },
  reloadButton: {
    color: theme.palette.normalFontColor.primary,
    marginTop: "10px",
    marginBottom: "20px",
  },
});

function descendingComparator(a, b, orderBy) {
  let items = [a[orderBy], b[orderBy]];

  if (typeof items[0] === "string") {
    items = items.map((value) => value.toLowerCase());
  }

  if (items[1] < items[0]) {
    return -1;
  }
  if (items[1] > items[0]) {
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
  return stabilizedThis.map((el, index) => {
    el[0].index = index + 1;
    return el[0];
  });
}

class Companies extends React.Component {
  state = {
    openDialog: false,
    companyCode: "AAPL",
    stockData: [],
    sortBy: "code",
    sortDirection: SortDirection.ASC,
    price: [-250, 1000],
    marketCap: [250, 1040], // [$1K, $3T]
    sector: "All",
    industry: "All",
    success: false,
    fail: false,
    loading: false,
    debounce: false,
  };

  handleSort = (sortDirection, sortBy) => {
    if (sortBy === "index") return;

    let { stockData } = this.state;
    this.setState({
      stockData: stableSort(stockData, getComparator(sortDirection, sortBy)),
      sortBy: sortBy,
      sortDirection: sortDirection,
    });
  };

  handleOpenDialog = ({ rowData }) => {
    this.setState({
      openDialog: true,
      companyCode: rowData.code,
    });
  };

  handleCloseDialog = () => {
    this.setState({
      openDialog: false,
    });
  };

  // Price scale: y = 10 ^ (0.0055051499 * x)
  getPrice = (value) => {
    return 10 ** (0.0055051499 * value);
  };

  // MarketCap scale: y = 10 ^ (0.012 * x)
  getMarketCap = (value) => {
    return 10 ** (0.012 * value);
  };

  handleFilterChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  setSuccess = () => {
    this.setState({
      loading: false,
      success: true,
      fail: false,
    });
  };

  setError = () => {
    this.setState({
      loading: false,
      success: false,
      fail: true,
    });
  };

  handleReload = () => {
    if (this.state.debounce) return;

    this.setState({
      loading: true,
      debounce: true,
    });
    this.updateStockScreener(this.setSuccess, this.setError);
    setTimeout(() => {
      this.setState({ debounce: false });
    }, 5000);
  };

  updateStockScreener = (callback = () => {}, errorCallback = () => {}) => {
    const { price, marketCap, sector, industry } = this.state;
    let { stockRatings } = this.state;

    getStockScreener({
      priceFilter: price,
      marketCapFilter: marketCap.map((value) => this.getMarketCap(value)),
      sectorFilter: sector,
      industryFilter: industry,
    })
      .then((stockData) => {
        // fetch ratingData on mount
        if(!stockRatings)
          return Promise.all([stockData, getAllCompaniesRating()]);
        return ([stockData]);
      })
      .then(([stockData, newRatings]) => {
        const { sortDirection, sortBy } = this.state;

        if(!stockRatings)
          stockRatings = newRatings;

        // attach rating to stockData
        stockData.map((stock) => {
          const ratingData = stockRatings.find((stockRating) => stockRating.symbol === stock.code);
          stock.rating = ratingData ? ratingData.rating : "-";
          return stock;
        });

        this.setState({
          stockData: stableSort(
            stockData,
            getComparator(sortDirection, sortBy)
          ),
          stockRatings,
        });
        callback();
      })
      .catch((err) => {
        errorCallback();
        console.log(err);
      });
  };

  componentDidMount() {
    this.updateStockScreener();
  }

  render() {
    const { classes } = this.props;
    const {
      openDialog,
      companyCode,
      sortBy,
      sortDirection,
      stockData,
      price,
      marketCap,
      sector,
      industry,
      success,
      fail,
      loading,
    } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid item xs={12} sm={4} className={classes.itemGrid}>
            <ProgressButton
              containerClass={classes.reloadButton}
              size={"medium"}
              success={success}
              fail={fail}
              loading={loading}
              handleClick={this.handleReload}
            >
              Reload
            </ProgressButton>
            <Filter
              price={price}
              marketCap={marketCap}
              sector={sector}
              industry={industry}
              getPrice={this.getPrice}
              getMarketCap={this.getMarketCap}
              handleChange={this.handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography className={classes.gridTitle} component="div">
              Companies
            </Typography>

            <CompaniesListTable
              height={600}
              rows={stockData}
              sortBy={sortBy}
              sortDirection={sortDirection}
              handleSort={this.handleSort}
              handleOpenCompanyDetail={this.handleOpenDialog}
            />

            <Typography className={classes.caption}>
              {`Showing ${stockData.length} result` +
                (stockData.length > 1 ? "s" : "")}
            </Typography>
          </Grid>
        </Grid>

        <CompanyDialog
          open={openDialog}
          handleClose={this.handleCloseDialog}
          companyCode={companyCode}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(Companies)));
