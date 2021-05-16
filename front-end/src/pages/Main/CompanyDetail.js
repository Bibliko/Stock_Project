import React from "react";
import clsx from "clsx";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import { socket } from "../../App";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { getFullStockInfo } from "../../utils/RedisUtil";
import { changeUserData } from "../../utils/UserUtil";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";
import NamePriceGraph from "../../components/CompanyDetail/NamePriceGraph";
import CompanyAbout from "../../components/CompanyDetail/CompanyAbout";
import CompanyNewsContainer from "../../components/CompanyDetail/CompanyNews/CompanyNewsContainer";
import CompanyActions from "../../components/CompanyDetail/CompanyActions";
import SegmentedBar from "../../components/ProgressBar/SegmentedBar";

import { withStyles } from "@material-ui/core/styles";
import { Container, Typography, Grid, Button } from "@material-ui/core";

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
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    maxWidth: "none",
  },
  title2: {
    fontSize: "x-large",
    fontWeight: "bold",
    color: "white",
  },
  fullWidth: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    margin: 0,
  },
  segmentedBar: {
    position: "absolute",
    left: "calc((100% - 100px) / 2)",
  },
  actionsContainer: {
    height: "fit-content",
    position: "sticky",
    top: `calc(${theme.customHeight.appBarHeight} + ${theme.customMargin.topLayout})`,
  },
  tranactionsCard: {
    width: "100%",
  },
  watchlistButton: {
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    fontWeight: "bold",
    textTransform: "none",
  },
  watchlistButtonRemove: {
    color: theme.palette.secondary.main,
    border: `1px solid ${theme.palette.secondary.main}`,
  },
});

class CompanyDetail extends React.Component {
  state = {
    companyCode: "",
    companyData: {},

    errorMessage: "",

    finishedSettingUp: false,
  };

  addToWatchlist = () => {
    const { companyCode } = this.state;
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
    const { companyCode } = this.state;
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

  componentDidMount() {
    const { companyCode } = this.props.match.params;
    getFullStockInfo(companyCode)
      .then((companyData) => {
        this.setState(
          {
            companyCode: companyCode.toUpperCase(),
            companyData,
            finishedSettingUp: true,
          },
          () => {
            console.log(this.state.companyData);
          }
        );
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.data &&
          err.response.data === "Share symbols do not exist in FMP."
        ) {
          this.setState({
            errorMessage: `Company code ${companyCode.toUpperCase()} does not exist.`,
            finishedSettingUp: true,
          });
        } else {
          console.log(err);
        }
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "userSession"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, userSession } = this.props;
    const {
      companyCode,
      companyData,
      errorMessage,

      finishedSettingUp,
    } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        {!finishedSettingUp && (
          <SegmentedBar className={classes.segmentedBar} />
        )}
        {finishedSettingUp && (
          <Grid
            container
            spacing={2}
            direction="row"
            className={classes.fullWidth}
          >
            {errorMessage !== "" && (
              <Typography className={classes.title2}>{errorMessage}</Typography>
            )}
            {errorMessage === "" && (
              <React.Fragment>
                <Grid
                  item
                  xs={12}
                  md={9}
                  container
                  spacing={2}
                  direction="row"
                  className={classes.fullWidth}
                >
                  <NamePriceGraph
                    companyName={companyData.companyName}
                    companyCode={companyCode}
                    recentPrice={companyData.price}
                  />

                  <CompanyAbout companyData={companyData} />

                  <CompanyNewsContainer companyData={companyData} />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={3}
                  container
                  spacing={4}
                  direction="row"
                  className={clsx(classes.actionsContainer, classes.fullWidth)}
                >
                  <Grid item xs={12}>
                    <CompanyActions
                      companyCode={companyCode}
                      className={classes.transactionsCard}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.fullWidth}>
                    <Button
                      variant="outlined"
                      className={clsx(classes.watchlistButton, {
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
                  </Grid>
                </Grid>
              </React.Fragment>
            )}
            <SpaceDivMainPages />
          </Grid>
        )}
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
)(withStyles(styles)(withRouter(CompanyDetail)));
