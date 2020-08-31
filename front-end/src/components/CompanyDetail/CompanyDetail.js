import React from "react";
import { isEqual } from "lodash";
import clsx from "clsx";

import SharePriceTableContainer from "./SharePriceTableContainer";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
//import DatePickerHistory from "./DatePickerHistory";

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

class CompanyDetail extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Grid
        container
        spacing={4}
        direction="row"
        className={classes.fullHeightWidth}
      >
        <Grid item xs={12} className={classes.itemGrid}>
          <SharePriceTableContainer />
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(CompanyDetail);
