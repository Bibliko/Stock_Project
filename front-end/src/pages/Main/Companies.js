import React from "react";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Button from '@material-ui/core/Button';

import CompanyDialog from "../../components/CompanyDetail/CompanyDialog";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: "100px",
    [theme.breakpoints.down("xs")]: {
      width: "85%",
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
  datePickerGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    //flexDirection: "column",
  },
  gridTitle: {
    fontSize: "x-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1px",
  },
  titleLabel: {
    color: "#DC3D4A",
  },
  title: {
    color: "white",
    fontSize: "20px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
    },
    paddingLeft: "5px",
    fontWeight: "bold",
  },
  textFieldContainer: {
    maxWidth: "fit-content",
    minWidth: "150px",
    marginLeft: "5px",
    marginRight: "5px",
  },
});

class Companies extends React.Component {
  state = {
    openDialog: false,
  };

  handleOpen = () => {
    this.setState({
      openDialog: true,
      companyName: 'bibliko',
    });
  };

  handleClose = () => {
    this.setState({
      openDialog: false,
    });
  };

  render() {
    const { classes } = this.props;
    const {
      openDialog,
      companyName,
    } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <Button variant="outlined" color="primary" onClick={this.handleOpen}>
              Open
            </Button>
          </Grid>
        </Grid>
        <CompanyDialog
          open={openDialog}
          handleClose={this.handleClose}
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
