import React from "react";
import { withRouter } from "react-router";
import clsx from "clsx";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

import CompanyDialog from "../../components/CompanyDetail/CompanyDialog";
import CompaniesListTable from "../../components/Table/CompaniesListTable/CompaniesListTable"

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
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    flexBasis: "unset",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  gridTitle: {
    fontSize: "x-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1px",
    color: "white",
  },
});

class Companies extends React.Component {
  state = {
    openDialog: false,
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

  render() {
    const { classes } = this.props;
    const { openDialog, companyName } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle)}>
              Companies List
            </Typography>
          </Grid>
            <CompaniesListTable
              height={500}
              handleOpenCompanyDetail={this.handleOpenDialog}
            />
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
