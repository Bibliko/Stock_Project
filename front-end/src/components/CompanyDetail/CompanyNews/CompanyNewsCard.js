import React from "react";
import PropTypes from "prop-types";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { openInNewTab } from "../../../utils/low-dependency/PageRedirectUtil";
import {
  oneSecond,
  simplifyMiliseconds,
} from "../../../utils/low-dependency/DayTimeUtil";

import { DateTime } from "luxon";

import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

const styles = (theme) => ({
  brandAndTime: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: "8px",
  },
  brandFont: {
    fontSize: "medium",
    color: "white",
    marginRight: "8px",
  },
  timeFont: {
    fontSize: "medium",
    color: theme.palette.normalFontColor.secondary,
  },
  title: {
    fontSize: "large",
    fontWeight: "bold",
    color: "white",
    marginBottom: "5px",
  },
  companyGrid: {
    alignSelf: "center",
    width: "100%",
    marginBottom: theme.customMargin.companyDetailPageSectionMarginBottom,
    transition: "background-color 0.1s linear",
    backgroundColor: "transparent",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: theme.palette.paperBackground.hoverBlur,
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
});

class CompanyNewsCard extends React.Component {
  state = {
    publishedTimeFromNow: "",
  };

  intervalUpdatePublishedTimeFromNow;

  setStatePublishedTime = () => {
    const { publishedDate } = this.props.newsObject;
    const { publishedTimeFromNow } = this.state;

    const time =
      new Date().getTime() -
      DateTime.fromSQL(publishedDate, { zone: "America/New_York" }).toMillis();

    if (!isEqual(simplifyMiliseconds(time), publishedTimeFromNow)) {
      this.setState({
        publishedTimeFromNow: simplifyMiliseconds(time),
      });
    }
  };

  componentDidMount() {
    this.setStatePublishedTime();

    this.intervalUpdatePublishedTimeFromNow = setInterval(() => {
      this.setStatePublishedTime();
    }, oneSecond * 10);
  }

  componentWillUnmount() {
    clearInterval(this.intervalUpdatePublishedTimeFromNow);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "newsObject"];
    const compareProps = pick(this.props, compareKeys);
    const compareNextProps = pick(nextProps, compareKeys);

    return (
      !isEqual(compareNextProps, compareProps) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, newsObject } = this.props;
    const { publishedTimeFromNow } = this.state;

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
              {publishedTimeFromNow}
            </Typography>
          </div>
          <Typography className={classes.title}>{newsObject.title}</Typography>
          <Typography className={classes.timeFont} noWrap>
            {newsObject.text}
          </Typography>
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
