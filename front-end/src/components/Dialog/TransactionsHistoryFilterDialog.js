import React from "react";
import clsx from "clsx";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import SwipeableViews from "react-swipeable-views";

import { changeOpacityOfRGBAString } from "../../theme/ThemeUtil";

import Type from "../TabPanel/TransactionsHistoryFilterTabPanel/type";
import Code from "../TabPanel/TransactionsHistoryFilterTabPanel/code";
import TransactionTime from "../TabPanel/TransactionsHistoryFilterTabPanel/transactionTime";
import NumberFromToFilter from "../TabPanel/TransactionsHistoryFilterTabPanel/numberFromToFilter";

import { withStyles, withTheme } from "@material-ui/core/styles";
import {
  Dialog,
  AppBar,
  Tabs,
  Tab,
  Box,
  IconButton,
  Button,
} from "@material-ui/core";
import {
  DoneAllRounded as DoneAllRoundedIcon,
  ClearRounded as ClearRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      paddingTop: 0,
      backgroundColor: theme.palette.paperBackground.onPage,
      color: "white",
      display: "flex",
      alignItems: "flex-start",
      height: "70%",
      width: "350px",
      [theme.breakpoints.down("xs")]: {
        maxWidth: "320px",
      },
    },
  },
  dialogTitle: {
    "& .MuiTypography-root": {
      [theme.breakpoints.down("xs")]: {
        fontSize: "medium",
      },
      fontWeight: "bold",
    },
  },
  dialogAppBar: {
    background: theme.palette.primary.subDarker,
  },
  tab: {
    "&.MuiTab-textColorPrimary": {
      "&.Mui-selected": {
        color: theme.palette.secondary.main,
      },
      color: theme.palette.normalFontColor.primary,
    },
  },
  tabs: {
    color: theme.palette.secondary.main,
  },
  views: {
    width: "100%",
    paddingTop: "25px",
    paddingBottom: "0px",
  },
  viewsAtChange: {
    paddingBottom: "24px",
  },
  tabPanel: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    flexDirection: "column",
  },
  clearButton: {
    alignSelf: "flex-end",
    position: "absolute",
    bottom: "0px",
    color: theme.palette.fail.main,
  },
  doneButton: {
    alignSelf: "flex-end",
    position: "absolute",
    bottom: "0px",
    right: "50px",
    color: theme.palette.secondary.main,
  },
  clearAll: {
    alignSelf: "flex-end",
    position: "absolute",
    top: "calc((100% - 70%) / 2)",
    right: "10px",
    color: theme.palette.fail.main,
    fontWeight: "bold",
    backgroundColor: changeOpacityOfRGBAString(theme.palette.fail.main, "0.1"),
    "&:hover": {
      backgroundColor: changeOpacityOfRGBAString(
        theme.palette.fail.main,
        "0.2"
      ),
    },
    zIndex: theme.customZIndex.floatingActionButton,
  },
  hide: {
    display: "none",
  },
});

function TabPanel(props) {
  const { children, value, index, classes, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3} className={classes.box}>
          {children}
        </Box>
      )}
    </div>
  );
}

function tabProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

/**
  Props:
  filters={filters}
  openFilterDialog={openFilterDialog}
  handleChangeFilters={this.handleChangeFilters}
  handleClose={this.closeFilterDialog}
 */
class TransactionsHistoryFilterDialog extends React.Component {
  state = {
    tabPage: 0,
    clearTemporaryValuesFlag: false, // true or false: just a flag -> values don't mean anything
    errorReports: 0,
  };

  keys = ["Quantity", "Price", "Gain/Loss"];

  defaultFilters = {
    type: "none", // buy, sell, OR none
    code: "none", // none OR random string with NO String ";"
    quantity: "none_to_none", // (int/none)_to_(int/none)
    price: "none_to_none", // (int/none)_to_(int/none)
    spendOrGain: "none_to_none", // (int/none)_to_(int/none)
    transactionTime: "none_to_none", // (DateTime/none)_to_(DateTime/none)
  };

  fallbackFilters;

  timeoutToUpdateFilterCode;

  handleChangeTabPage = (event, newValue) => {
    this.setState({
      tabPage: newValue,
    });
  };

  handleChangeIndexTabPage = (index) => {
    this.setState({
      tabPage: index,
    });
  };

  reportError = (trueOrFalse) => {
    const { errorReports } = this.state;
    this.setState({
      errorReports: trueOrFalse
        ? errorReports + 1
        : errorReports > 0
        ? errorReports - 1
        : 0,
    });
  };

  doneFilters = () => {
    this.fallbackFilters = this.props.filters;
    this.props.handleDoneFilters();
    this.props.handleClose();
  };

  clearFilters = () => {
    this.setState({
      clearTemporaryValuesFlag: !this.state.clearTemporaryValuesFlag,
      errorReports: 0,
    });
    this.props.handleChangeFilters(this.fallbackFilters);
  };

  clearAllFilters = () => {
    this.setState({
      clearTemporaryValuesFlag: !this.state.clearTemporaryValuesFlag,
      errorReports: 0,
    });
    this.props.handleChangeFilters(this.defaultFilters);
  };

  componentDidMount() {
    this.fallbackFilters = this.props.filters;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["classes", "openFilterDialog", "filters"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const {
      classes,
      theme,

      filters,
      openFilterDialog,

      handleChangeFilters,
      handleClose,
    } = this.props;

    const { tabPage, clearTemporaryValuesFlag, errorReports } = this.state;

    return (
      <Dialog
        onClose={handleClose}
        open={openFilterDialog}
        className={classes.dialogPaper}
      >
        <AppBar position="static" className={classes.dialogAppBar}>
          <Tabs
            value={tabPage}
            onChange={this.handleChangeTabPage}
            variant="fullWidth"
            aria-label="full width tabs example"
            className={classes.tabs}
          >
            <Tab label="Strings" {...tabProps(0)} className={classes.tab} />
            <Tab label="Numbers" {...tabProps(1)} className={classes.tab} />
          </Tabs>
        </AppBar>
        <Button
          className={clsx(classes.clearAll, {
            [classes.hide]: isEqual(filters, this.defaultFilters),
          })}
          onClick={this.clearAllFilters}
        >
          Clear All
        </Button>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={tabPage}
          onChangeIndex={this.handleChangeIndexTabPage}
          className={clsx(classes.views, {
            [classes.viewsAtChange]:
              !isEqual(filters, this.fallbackFilters) ||
              !isEqual(filters, this.defaultFilters),
          })}
        >
          <TabPanel
            value={tabPage}
            index={0}
            dir={theme.direction}
            classes={{
              box: classes.tabPanel,
            }}
          >
            <Type filters={filters} handleChangeFilters={handleChangeFilters} />
            <Code
              reportError={this.reportError}
              clearFlag={clearTemporaryValuesFlag}
              handleChangeFilters={handleChangeFilters}
              filters={filters}
            />
            <TransactionTime
              reportError={this.reportError}
              clearFlag={clearTemporaryValuesFlag}
              filters={filters}
              handleChangeFilters={handleChangeFilters}
            />
          </TabPanel>
          <TabPanel
            value={tabPage}
            index={1}
            dir={theme.direction}
            classes={{
              box: classes.tabPanel,
            }}
          >
            {this.keys.map((key) => (
              <NumberFromToFilter
                key={key}
                reportError={this.reportError}
                clearFlag={clearTemporaryValuesFlag}
                filterName={key}
                filters={filters}
                handleChangeFilters={handleChangeFilters}
              />
            ))}
          </TabPanel>
        </SwipeableViews>
        {!isEqual(filters, this.fallbackFilters) && (
          <React.Fragment>
            <IconButton
              aria-label="done"
              className={clsx(classes.doneButton, {
                [classes.hide]: errorReports > 0,
              })}
              onClick={this.doneFilters}
            >
              <DoneAllRoundedIcon />
            </IconButton>
            <IconButton
              aria-label="clear"
              className={classes.clearButton}
              onClick={this.clearFilters}
            >
              <ClearRoundedIcon />
            </IconButton>
          </React.Fragment>
        )}
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  withTheme(withRouter(TransactionsHistoryFilterDialog))
);
