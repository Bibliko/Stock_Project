import React from "react";
import PropTypes from "prop-types";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import {
  simplifyNumber,
  numberWithCommas,
  roundNumber,
} from "../../utils/low-dependency/NumberUtil";

import { capitalizeString } from "../../utils/low-dependency/StringUtil";

import { withStyles } from "@material-ui/core/styles";
import { Typography, Grid, Button, Divider } from "@material-ui/core";

const styles = (theme) => ({
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
  spaceBottom: {
    marginBottom: "30px",
  },
  companyGrid: {
    alignSelf: "center",
    width: "100%",
    marginBottom: theme.customMargin.companyDetailPageSectionMarginBottom,
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: "5px",
    marginBottom: "20px",
  },
  bodyText: {
    color: "white",
    marginBottom: "20px",
    lineHeight: "1.75",
  },
  descriptionButton: {
    padding: 0,
    paddingLeft: "5px",
    fontSize: "smaller",
    fontWeight: "bold",
    color: theme.palette.secondary.main,
    "&:hover": {
      color: theme.palette.primary.subDark,
    },
  },
  title3: {
    fontSize: "small",
    fontWeight: "bold",
    color: "white",
  },
  websiteLink: {
    fontSize: "14px",
    color: "white",
    marginTop: "5px",
    marginBottom: "10px",
  },
  fontSmallDetail: {
    fontSize: "small",
    color: "white",
  },
  showDetailButtonGrid: {
    width: "100%",
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  showDetailButton: {
    fontWeight: "bold",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.hover,
    },
  },
});

class CompanyAbout extends React.Component {
  state = {
    showFullDescription: false,
    showFullDetails: false,
    companyDescription: this.props.companyData.description.substring(0, 350),
  };

  extendDescription = () => {
    this.setState({
      showFullDescription: true,
      companyDescription: this.props.companyData.description,
    });
  };

  shrinkDescription = () => {
    this.setState({
      showFullDescription: false,
      companyDescription: this.props.companyData.description.substring(0, 350),
    });
  };

  switchShowingDetails = () => {
    this.setState({
      showFullDetails: !this.state.showFullDetails,
    });
  };

  gridElement = (title, detail, classes) => {
    return (
      <Grid item xs={6} sm={4} md={3}>
        <Typography className={classes.title3}>{title}</Typography>
        <Typography className={classes.fontSmallDetail}>{detail}</Typography>
      </Grid>
    );
  };

  componentDidUpdate() {
    if (!this.state.showFullDescription)
      this.setState({companyDescription: this.props.companyData.description.substring(0, 350)});
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "companyData"];
    const compareProps = pick(this.props, compareKeys);
    const compareNextProps = pick(nextProps, compareKeys);

    return (
      !isEqual(compareNextProps, compareProps) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, companyData } = this.props;
    const { companyDescription, showFullDescription, showFullDetails } = this.state;

    return (
      <Grid
        container
        spacing={2}
        direction="column"
        className={classes.companyGrid}
        item
        xs={12}
      >
        <Typography className={classes.title2}>About</Typography>
        <Typography className={classes.websiteLink}>
          {"Website: "}
          <a
            href={companyData.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white" }}
          >
            {companyData.website}
          </a>
        </Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.bodyText}>
          {companyDescription}
          {showFullDescription && (
            <Button
              className={classes.descriptionButton}
              disableRipple
              onClick={this.shrinkDescription}
            >
              See Less
            </Button>
          )}
          {!showFullDescription && (
            <Button
              className={classes.descriptionButton}
              disableRipple
              onClick={this.extendDescription}
            >
              See More
            </Button>
          )}
        </Typography>
        <Grid
          item
          xs={12}
          container
          direction="row"
          spacing={2}
          style={{ alignSelf: "center" }}
        >
          {this.gridElement(
            "IPO Date",
            new Date(companyData.ipoDate).toDateString(),
            classes
          )}

          {this.gridElement("CEO", companyData.ceo, classes)}

          {this.gridElement(
            "Employees",
            numberWithCommas(companyData.fullTimeEmployees),
            classes
          )}

          {this.gridElement(
            "Head Quarter",
            `${companyData.city}, ${capitalizeString(companyData.state)}`,
            classes
          )}

          {this.gridElement("Industry", companyData.industry, classes)}

          {this.gridElement("Sector", companyData.sector, classes)}

          {this.gridElement("Exchange", companyData.exchangeShortName, classes)}

          {showFullDetails &&
            this.gridElement(
              "Market Cap",
              simplifyNumber(companyData.marketCap),
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Average Volume",
              simplifyNumber(companyData.volAvg),
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Volume",
              simplifyNumber(companyData.volume),
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Day High",
              `$${roundNumber(companyData.dayHigh, 2)}`,
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Day Low",
              `$${roundNumber(companyData.dayLow, 2)}`,
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Year High",
              `$${roundNumber(companyData.yearHigh, 2)}`,
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Year Low",
              `$${roundNumber(companyData.yearLow, 2)}`,
              classes
            )}

          {showFullDetails &&
            this.gridElement(
              "Open Price",
              `$${roundNumber(companyData.open, 2)}`,
              classes
            )}
        </Grid>
        <Grid item xs={12} className={classes.showDetailButtonGrid}>
          <Button
            className={classes.showDetailButton}
            onClick={this.switchShowingDetails}
          >
            {showFullDetails && "Show Less"}
            {!showFullDetails && "Show More"}
          </Button>
        </Grid>
      </Grid>
    );
  }
}

CompanyAbout.propTypes = {
  classes: PropTypes.object.isRequired,
  companyData: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(CompanyAbout));
