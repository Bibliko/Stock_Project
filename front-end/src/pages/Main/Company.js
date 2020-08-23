import React from "react";
import { isEqual } from "lodash";
import clsx from "clsx";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import SharePriceTableContainer from "../../components/Table/SharePriceTable/SharePriceTableContainer";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import DatePickerHistory from "../../components/DatePicker/DatePickerHistory";

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
    //justifyContent: "center",
    alignItems: "flex-start",
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
    maxWidth: "none",
    minWidth: "150px",
    marginLeft: "10px",
    marginRight: "10px",
  },
});

class Company extends React.Component {
  componentDidMount() {
    console.log(this.props.userSession);
  }

  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.titleLabel)}>
              Company
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.titleLabel)}>
              Share price
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <SharePriceTableContainer />
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.titleLabel)}>
              Price history chart
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} className={classes.datePickerGrid}>
            <Container className={classes.textFieldContainer}>
              <Typography className={classes.title}> From </Typography>
              <DatePickerHistory
              //name="FROM" //onChange={this.handleChange}
              />
            </Container>
          </Grid>
          <Grid item xs={12} sm={6} className={classes.datePickerGrid}>
            <Container className={classes.textFieldContainer}>
              <Typography className={classes.title}> To </Typography>
              <DatePickerHistory
              //name="FROM" //onChange={this.handleChange}
              />
            </Container>
          </Grid>
        </Grid>
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
)(withStyles(styles)(withRouter(Company)));
