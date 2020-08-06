import React from "react";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import WatchlistTableContainer from "../../components/Table/WatchlistTable/WatchlistTableContainer";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: theme.margin.topLayout,
    [theme.breakpoints.down("xs")]: {
      width: "85%",
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
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
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
  state = {
    searchCompany: "",
  };

  componentDidMount() {
    console.log(this.props.userSession);
  }

  render() {
    const { classes, userSession } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Grid container spacing={4} className={classes.fullWidth}>
          <Grid item xs={12} className={classes.itemGrid}>
            {isEmpty(userSession.watchlist) && (
              <Typography className={classes.watchlistStartingText}>
                Start by adding companies to your watchlist!
              </Typography>
            )}
            {!isEmpty(userSession.watchlist) && (
              <WatchlistTableContainer rows={userSession.watchlist} />
            )}
          </Grid>
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
