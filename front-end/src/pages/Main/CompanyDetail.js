import React from "react";
import clsx from "clsx";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { getFullStockInfo } from "../../utils/RedisUtil";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";
import NamePriceGraph from "../../components/CompanyDetail/NamePriceGraph";
import CompanyAbout from "../../components/CompanyDetail/CompanyAbout";
import CompanyNewsContainer from "../../components/CompanyDetail/CompanyNews/CompanyNewsContainer";
import CompanyActions from "../../components/CompanyDetail/CompanyActions";
import SegmentedBar from "../../components/ProgressBar/SegmentedBar";

import { withStyles } from "@material-ui/core/styles";
import { Container, Typography, Grid } from "@material-ui/core";

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
});

class CompanyDetail extends React.Component {
  state = {
    companyCode: "",
    companyData: {},

    errorMessage: "",

    finishedSettingUp: false,
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
    const compareKeys = ["classes"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;
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
                  className={clsx(classes.actionsContainer, classes.fullWidth)}
                >
                  <CompanyActions
                    companyCode={companyCode}
                    className={classes.transactionsCard}
                  />
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

export default withStyles(styles)(withRouter(CompanyDetail));
