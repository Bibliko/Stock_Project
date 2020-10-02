import React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { withStyles } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

// import CompanyDetail from "./CompanyDetail";
// import CompanyGraph from "./CompanyGraph";

const styles = (theme) => ({
  root: {
    width: "100%",
  },

  fullHeightWdith: {
    height: "100%",
    width: "100%",
  },

  dialogTitle: {
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

  render() {
    const { classes, handleClose, open, companyName } = this.props;
    const { value } = this.state;

    return (
      <div>
        <Dialog
          className={classes.root}
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle className={classes.dialogTitle}>
            {companyName}
          </DialogTitle>

          <DialogContent className={classes.dialogContent}>
            <AppBar position="sticky" color="default">
              <Tabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="full width tabs example"
              >
                <Tab
                  label="Info"
                  className={classes.dialogTab}
                  {...a11yProps(0)}
                />
                <Tab
                  label="Graph"
                  className={classes.dialogTab}
                  {...a11yProps(1)}
                />
                <Tab
                  label="About"
                  className={classes.dialogTab}
                  {...a11yProps(2)}
                />
              </Tabs>
            </AppBar>
            <SwipeableViews
              index={value}
              onChangeIndex={this.handleChangeIndex}
            >
              <TabPanel value={value} index={0}>
              </TabPanel>
              <TabPanel value={value} index={1}>
              </TabPanel>
              <TabPanel value={value} index={2}></TabPanel>
            </SwipeableViews>
          </DialogContent>

          <DialogActions className={classes.dialogAction}>
            <Button onClick={handleClose} color="primary">
              Buy
            </Button>
            <Button onClick={handleClose} color="primary">
              Sell
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(CompanyDialog);
