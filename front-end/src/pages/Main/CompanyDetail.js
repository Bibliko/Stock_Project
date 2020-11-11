import React from "react";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import { getFullStockInfo } from "../../utils/RedisUtil";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";
import NamePriceGraph from "../../components/CompanyDetail/NamePriceGraph";
import CompanyAbout from "../../components/CompanyDetail/CompanyAbout";
import CompanyNewsContainer from "../../components/CompanyDetail/CompanyNews/CompanyNewsContainer";

import { withStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
} from "@material-ui/core";

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
    flexDirection: "column",
    maxWidth: "none",
  },
  title2: {
    fontSize: "x-large",
    fontWeight: "bold",
    color: "white",
  },
  fullWidth: {
    width: "100%",
    margin: 0,
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
          err.response.data &&
          err.response.data === "Share symbols do not exist in FMP."
        ) {
          this.setState({
            errorMessage: `Company code ${companyCode} does not exist.`,
          });
        } else {
          console.log(err);
        }
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.userSession, this.props.userSession) ||
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
        {!finishedSettingUp && <CircularProgress />}
        {finishedSettingUp && (
          <Grid
            container
            spacing={2}
            direction="column"
            className={classes.fullWidth}
          >
            {errorMessage !== "" && (
              <Typography className={classes.title2}>{errorMessage}</Typography>
            )}
            {errorMessage === "" && (
              <React.Fragment>
                <NamePriceGraph
                  companyName={companyData.companyName}
                  companyCode={companyCode}
                  recentPrice={companyData.price}
                />

                <CompanyAbout companyData={companyData} />

                <CompanyNewsContainer companyData={companyData} />
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

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(CompanyDetail))
);
