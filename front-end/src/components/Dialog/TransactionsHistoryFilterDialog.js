import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import SwipeableViews from "react-swipeable-views";

import Type from "../TabPanel/TransactionsHistoryFilterTabPanel/type";
import Code from "../TabPanel/TransactionsHistoryFilterTabPanel/code";

import { withStyles, withTheme } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

const styles = (theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      paddingTop: 0,
      paddingBottom: 32,
      backgroundColor: theme.palette.paperBackground.onPage,
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
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
    backgroundColor: theme.palette.appBarBlue.main,
  },
  tab: {
    "&.MuiTab-textColorPrimary": {
      "&.Mui-selected": {
        color: theme.palette.primary.main,
      },
      color: "white",
    },
  },
  views: {
    width: "100%",
  },
  tabPanel: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    flexDirection: "column",
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

class TransactionsHistoryFilterDialog extends React.Component {
  state = {
    tabPage: 0,
  };

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

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["openFilterDialog"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return (
      !isEqual(nextState, this.state) ||
      !isEqual(nextPropsCompare, propsCompare)
    );
  }

  render() {
    const {
      classes,
      theme,

      openFilterDialog,
      handleClose,
    } = this.props;

    const { tabPage } = this.state;

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
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab
              label="Choose Filters"
              {...tabProps(0)}
              className={classes.tab}
            />
            <Tab
              label="Your Filters"
              {...tabProps(1)}
              className={classes.tab}
            />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={tabPage}
          onChangeIndex={this.handleChangeIndexTabPage}
          className={classes.views}
        >
          <TabPanel
            value={tabPage}
            index={0}
            dir={theme.direction}
            classes={{
              box: classes.tabPanel,
            }}
          >
            <Type />
            <Code />
          </TabPanel>
          <TabPanel
            value={tabPage}
            index={1}
            dir={theme.direction}
            classes={{
              box: classes.tabPanel,
            }}
          >
            Item Two
          </TabPanel>
        </SwipeableViews>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  withTheme(withRouter(TransactionsHistoryFilterDialog))
);
