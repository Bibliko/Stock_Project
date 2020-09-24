import React from "react";
import { withRouter } from "react-router";
import clsx from "clsx";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { withStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Typography,
} from "@material-ui/core";

import CompanyDialog from "../../components/CompanyDetail/CompanyDialog";
import CompaniesListTable from "../../components/Table/CompaniesListTable/CompaniesListTable"
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
    justifyContent: "center",
    maxWidth: "none",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  gridTitle: {
    fontSize: "x-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1px",
    color: "white",
    marginBottom: "5px",
  },
  reloadButton: {
    marginTop: "10px",
    marginBottom: "10px",
    marginLeft: "-10px",
  },
});

class Companies extends React.Component {
  state = {
    openDialog: false,
    price: [0,260000],
    marketCap: [0,1000],
    sector: "All",
    industry: "All",

    success: false,
    fail: false,
    loading: false,
    debounce: false,
  };

  handleOpenDialog = (companyName) => {
    this.setState({
      openDialog: true,
      companyName: companyName,
    });
  };

  handleCloseDialog = () => {
    this.setState({
      openDialog: false,
    });
  };

  getMarketCap = (value) => {
    return value**4;
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
    });
  };

  handleReload = () => {
    this.setState({
      loading: true,
      debounce: true,
    });
    setTimeout(this.setSuccess,2000);
    setTimeout(()=>{this.setState({debounce:false})},5000);
  };

  render() {
    const { classes } = this.props;
    const {
      openDialog,
      companyName,
      price,
      marketCap,
      sector,
      industry,

      debounce,
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
          <Grid item xs={12} sm={4}>
            <ProgressButton
              containerClass={classes.reloadButton}
              disabled={debounce}
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
              getMarketCap={this.getMarketCap}
              handleChange={this.handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography className={clsx(classes.gridTitle)} component="div">
              Companies List
            </Typography>

            <CompaniesListTable
              height={600}
              handleOpenCompanyDetail={this.handleOpenDialog}
            />
          </Grid>
        </Grid>

        <CompanyDialog
          open={openDialog}
          handleClose={this.handleCloseDialog}
          companyName={companyName}
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
