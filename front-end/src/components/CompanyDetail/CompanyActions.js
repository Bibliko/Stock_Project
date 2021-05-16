import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { isEqual, isEmpty, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Divider } from "@material-ui/core";

const styles = (theme) => ({
  actionsPaper: {
    padding: "20px",
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  title: {
    fontWeight: "bold",
    color: theme.palette.normalFontColor.primary,
  },
  body: {
    color: theme.palette.normalFontColor.primary,
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: "10px",
    marginBottom: "10px",
  },
});

class CompanyActionsPaper extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return !isEqual(nextPropsCompare, propsCompare);
  }

  render() {
    const {
      classes,
      paperClassName,
      titleClassName,
      companyCode,
      userSession,
    } = this.props;

    return (
      <Paper className={clsx(classes.actionsPaper, paperClassName)}>
        <Typography className={clsx(classes.title, titleClassName)}>
          {`Buy / Sell ${companyCode}`}
        </Typography>

        <Divider className={classes.divider} />

        {(!userSession || isEmpty(userSession)) && (
          <Typography className={classes.body}>
            Please login to trade stocks
          </Typography>
        )}

        {!isEmpty(userSession) && (
          <Typography className={classes.body}>Let's buy stock!</Typography>
        )}
      </Paper>
    );
  }
}

CompanyActionsPaper.propTypes = {
  classes: PropTypes.object.isRequired,
  paperClassName: PropTypes.string,
  titleClassName: PropTypes.string,
  companyCode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(CompanyActionsPaper))
);
