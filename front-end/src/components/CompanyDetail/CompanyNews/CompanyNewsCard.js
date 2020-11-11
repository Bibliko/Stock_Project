import React from "react";
import PropTypes from "prop-types";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { openInNewTab } from "../../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

const styles = (theme) => ({
  brandAndTime: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  brandFont: {
    fontSize: "medium",
    color: "white",
    marginRight: "10px",
  },
  timeFont: {
    fontSize: "medium",
    color: "white",
  },
  title: {
    fontSize: "xx-large",
    fontWeight: "bold",
    color: "white",
  },
  title2: {
    fontSize: "x-large",
    fontWeight: "bold",
    color: "white",
  },
  companyGrid: {
    alignSelf: "center",
    width: "100%",
    marginBottom: theme.customMargin.companyDetailPageSectionMarginBottom,
    "&:hover": {
      cursor: "pointer",
    },
  },
  imageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: "5px",
    marginBottom: "10px",
  },
  title3: {
    fontSize: "small",
    fontWeight: "bold",
    color: "white",
  },
});

class CompanyNewsCard extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["newsObject"];
    const compareProps = pick(this.props, compareKeys);
    const compareNextProps = pick(nextProps, compareKeys);

    return (
      !isEqual(compareNextProps, compareProps) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, newsObject } = this.props;

    return (
      <Grid
        container
        spacing={4}
        direction="row"
        className={classes.companyGrid}
        item
        xs={12}
        onClick={() => openInNewTab(newsObject.url)}
      >
        <Grid item xs={12} sm={4} className={classes.imageContainer}>
          <img
            alt={`${newsObject.symbol} News Source`}
            src={newsObject.image}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <div className={classes.brandAndTime}>
            <Typography className={classes.brandFont}>
              {newsObject.site}
            </Typography>
            <Typography className={classes.timeFont}>
              {newsObject.publishedDate}
            </Typography>
          </div>
          <Typography>{newsObject.title}</Typography>
          <Typography>{newsObject.text}</Typography>
        </Grid>
      </Grid>
    );
  }
}

CompanyNewsCard.propTypes = {
  classes: PropTypes.object.isRequired,
  newsObject: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(CompanyNewsCard));
