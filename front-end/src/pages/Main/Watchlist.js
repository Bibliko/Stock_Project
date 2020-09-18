import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import WatchlistTableContainer from "../../components/Table/WatchlistTable/WatchlistTableContainer";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: "none",
  },
  fullWidth: {
    width: "100%",
    minHeight: "200px",
    padding: "24px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  watchlistStartingText: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
  },
});

class WatchlistPage extends React.Component {
  componentDidMount() {
    console.log(this.props.userSession);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["email", "watchlist"];
    const nextPropsCompare = pick(nextProps.userSession, compareKeys);
    const propsCompare = pick(this.props.userSession, compareKeys);

    return !isEqual(nextPropsCompare, propsCompare);
  }

  render() {
    const { classes, userSession } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Grid container spacing={4} className={classes.fullWidth}>
          <WatchlistTableContainer rows={userSession.watchlist} />
          <SpaceDivMainPages />
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(WatchlistPage))
);
