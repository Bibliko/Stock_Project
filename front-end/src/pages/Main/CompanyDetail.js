import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";

import { getFullStockInfo } from "../../utils/RedisUtil";

import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Grid,
  Divider,
  Button,
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
  title3: {
    fontSize: "small",
    fontWeight: "bold",
    color: "white",
  },
  fontSmallDetail: {
    fontSize: "small",
    color: "white",
  },
  bodyText: {
    color: "white",
    marginBottom: "20px",
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: "5px",
    marginBottom: "10px",
  },
  spaceBottom: {
    marginBottom: "30px",
  },
  descriptionButton: {
    padding: 0,
    paddingLeft: "5px",
    fontSize: "smaller",
    color: theme.palette.bigTitle.lightBlue,
    "&:hover": {
      color: theme.palette.bigTitle.lightBlueHover,
    },
  },
  companyDetailGrid: {
    alignSelf: "center",
    width: "100%",
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

    showFullDescription: false,
    companyDetail: "",
  };

  componentDidMount() {
    const { companyCode } = this.props.match.params;
    getFullStockInfo(companyCode)
      .then((companyData) => {
        this.setState(
          {
            companyCode: companyCode.toUpperCase(),
            companyData,
            companyDetail: companyData.description.substring(0, 350),
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

  extendDescription = () => {
    this.setState({
      showFullDescription: true,
      companyDetail: this.state.companyData.description,
    });
  };

  shrinkDescription = () => {
    this.setState({
      showFullDescription: false,
      companyDetail: this.state.companyData.description.substring(0, 350),
    });
  };

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
      showFullDescription,
      companyDetail,
    } = this.state;

    return (
      <Container className={classes.root} disableGutters>
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
              <Typography className={classes.title}>
                {`${companyData.companyName} (${companyCode.toUpperCase()})`}
              </Typography>
              <Typography className={classes.title2}>
                {`$${companyData.price}`}
              </Typography>

              <Typography className={clsx(classes.title2, classes.spaceBottom)}>
                #Graph#
              </Typography>

              <Grid
                container
                spacing={2}
                direction="column"
                className={classes.companyDetailGrid}
                item
                xs={12}
              >
                <Typography className={classes.title2}>About</Typography>
                <Divider className={classes.divider} />
                <Typography className={classes.bodyText}>
                  {companyDetail}
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
                <Grid item xs={12} container direction="row" spacing={2}>
                  <Grid item xs={4}>
                    <Typography className={classes.title3}>CEO</Typography>
                    <Typography className={classes.fontSmallDetail}>
                      {companyData.ceo}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </React.Fragment>
          )}
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
  withStyles(styles)(withRouter(CompanyDetail))
);
