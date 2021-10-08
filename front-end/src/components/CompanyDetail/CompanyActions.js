import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { isEqual, isEmpty, pick } from "lodash";
import { withRouter } from "react-router";
import { socket } from "../../App";

import { connect } from "react-redux";
import { orderAction, userAction } from "../../redux/storeActions/actions";

import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";
import { changeUserData } from "../../utils/UserUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Divider,
  Button,
  ButtonGroup
} from "@material-ui/core";

const styles = (theme) => ({
  actionsPaper: {
    width: "100%",
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
    marginBottom: "18px",
  },
  actionButton: {
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    fontWeight: "bold",
  },
  watchlistButtonRemove: {
    color: theme.palette.secondary.main,
    border: `1px solid ${theme.palette.secondary.main}`,
  },
});

class CompanyActionsPaper extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return !isEqual(nextPropsCompare, propsCompare);
  }

  handlePlaceOrder = () => {
    this.props.mutateOrder({companyCode: this.props.companyCode});
    redirectToPage('/placeOrder', this.props)
  };

  addToWatchlist = () => {
    const { companyCode } = this.props;
    let { email, watchlist: newWatchlist } = this.props.userSession;

    newWatchlist.push(companyCode);
    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser, socket).catch(
      (err) => {
        console.log(err);
      }
    );
  };

  removeFromWatchlist = () => {
    const { companyCode } = this.props;
    let { email, watchlist: newWatchlist } = this.props.userSession;

    newWatchlist = newWatchlist.filter(
      (companyCodeString) => companyCodeString !== companyCode
    );

    const dataNeedChange = {
      watchlist: {
        set: newWatchlist,
      },
    };
    changeUserData(dataNeedChange, email, this.props.mutateUser, socket).catch(
      (err) => {
        console.log(err);
      }
    );
  };

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
          {`Actions for ${companyCode}`}
        </Typography>

        <Divider className={classes.divider} />

        {(!userSession || isEmpty(userSession)) && (
          <Typography className={classes.body}>
            Please login to trade stocks
          </Typography>
        )}

        <ButtonGroup
          orientation="vertical"
          aria-label="action button group"
          fullWidth
        >
          <Button
            onClick={this.handlePlaceOrder}
            aria-label="trade button"
            className={classes.actionButton}
          >
            {"Buy / Sell"}
          </Button>

          <Button
            aria-label="add/remove watchlist button"
            className={clsx(classes.actionButton, {
              [classes.watchlistButtonRemove]: userSession.watchlist.includes(
                companyCode
              ),
            })}
            onClick={
              userSession.watchlist.includes(companyCode)
                ? this.removeFromWatchlist
                : this.addToWatchlist
            }
          >
            {userSession.watchlist.includes(companyCode) &&
              "Remove from watchlist"}
            {!userSession.watchlist.includes(companyCode) &&
              "Add to watchlist"}
          </Button>
        </ButtonGroup>
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

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
  mutateOrder: (dataToChange) => dispatch(orderAction("change", dataToChange)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(CompanyActionsPaper)));
