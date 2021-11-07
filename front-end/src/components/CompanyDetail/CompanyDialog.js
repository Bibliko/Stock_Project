import React from "react";
import { withRouter } from "react-router";
import { isEqual } from "lodash";
import PropTypes from "prop-types";

import { withTranslation } from "react-i18next";

import { getFullStockInfo } from "../../utils/RedisUtil";
import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";

import SwipeableViews from "react-swipeable-views";
import { withStyles } from "@material-ui/core/styles";

import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";

import CompanyAbout from "../CompanyDetail/CompanyAbout";
import NamePriceGraph from "../../components/CompanyDetail/NamePriceGraph";

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  fullHeightWdith: {
    height: "100%",
    width: "100%",
  },
  dialogTitle: {
    cursor: "pointer",
    color: "white",
    backgroundColor: "#000033",
  },
  dialogContent: {
    color: "white",
    backgroundColor: "#000066",
    padding: "0px",
    height: "500px",
  },
  dialogTab: {
    backgroundColor: "#000033",
    color: "white",
  },
  dialogAction: {
    backgroundColor: "#000033",
  },
  errorText: {
    fontSize: "x-large",
    fontWeight: "bold",
    color: "white",
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  // children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

class CompanyDialog extends React.Component {
  state = {
    value: 0,
    open: false,
    errorMessage: "",
    companyData: {},
  };

  handleChange = (event, newValue) => {
    this.setState({
      value: newValue,
    });
  };

  handleChangeIndex = (index) => {
    this.setState({
      value: index,
    });
  };

  updateCompanyData = () => {
    const { companyCode } = this.props;
    getFullStockInfo(companyCode)
      .then((companyData) => {
        this.setState( { companyData } );
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.data &&
          err.response.data === "Share symbols do not exist in FMP."
        ) {
          this.setState({
            errorMessage: `Company code ${companyCode.toUpperCase()} does not exist.`,
          });
        } else {
          console.log(err);
        }
      });
  };

  componentDidMount() {
    this.updateCompanyData();
  }

  componentDidUpdate() {
    // reset tab when dialog is closed
    if (!this.props.open)
      this.setState({value: 0});

    this.updateCompanyData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps, this.props) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const {
      t,
      classes,
      handleAction,
      handleClose,
      open,
      companyCode,
    } = this.props;
    const { value, errorMessage, companyData } = this.state;

    return (
      <div>
        <Dialog
          className={classes.root}
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle
            className={classes.dialogTitle}
            onClick={() => {redirectToPage(`/company/${companyCode}`, this.props)}}
          >
            {`${companyData.companyName} (${companyCode.toUpperCase()})`}
          </DialogTitle>

          <DialogContent className={classes.dialogContent}>
            {errorMessage
              ? <Typography className={classes.errorText}> {errorMessage} </Typography>
              : <React.Fragment>
                  <AppBar position="sticky" color="default">
                    <Tabs
                      value={value}
                      onChange={this.handleChange}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="fullWidth"
                      aria-label="full width tabs"
                    >
                      <Tab
                        label={t("company.about")}
                        className={classes.dialogTab}
                        {...a11yProps(0)}
                      />
                      <Tab
                        label={t("company.graph")}
                        className={classes.dialogTab}
                        {...a11yProps(1)}
                      />
                    </Tabs>
                  </AppBar>
                  <SwipeableViews
                    index={value}
                    onChangeIndex={this.handleChangeIndex}
                  >
                    <TabPanel value={value} index={0}>
                      <CompanyAbout companyData={companyData} />
                    </TabPanel>

                    <TabPanel value={value} index={1}>
                      <NamePriceGraph
                        graphOnly
                        companyName={companyData.companyName}
                        companyCode={companyCode}
                        recentPrice={companyData.price}
                      />
                    </TabPanel>
                  </SwipeableViews>
                </React.Fragment>
            }
          </DialogContent>

          <DialogActions className={classes.dialogAction}>
            <Button onClick={handleAction} color="primary">
              {t("company.buySell")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withTranslation()(withStyles(styles)(withRouter(CompanyDialog)));
