import React from "react";
import { AppBar, Tabs, Tab, Box, Typography, Button } from "@material-ui/core";
import PropTypes from "prop-types";
import { redirectToPage } from "../../../utils/low-dependency/PageRedirectUtil";
import { getOverallRanking, getRegionalRanking } from "../../../utils/UserUtil";
import { withStyles } from "@material-ui/core/styles";
import SwipeableViews from "react-swipeable-views";

const styles = (theme) => ({
  root: {
    // width: theme.customWidth.redirectingPaper,
    // height: theme.customHeight.redirectingPaper,
    backgroundColor: theme.palette.paperBackground.onPage,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    minHeight: "200px",
  },
  appBar: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "white",
  },
  tab: {
    color: "#9ED2EF",
  },
  button: {
    marginRight: "30px",
    marginBottom: "40px",
    color: "#9ED2EF",
    fontWeight: "bold",
  },
});

function TabPanel(props) {
  const { children, selectedTab, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={selectedTab !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {selectedTab === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  selectedTab: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

class RankingPaper extends React.Component {
  state = {
    overall: [],
    region: [],
    selectedTab: 0,
  };

  handleChange = (event, newSelectedTab) => {
    this.setState({
      selectedTab: newSelectedTab,
    });
  };

  handleChangeIndex = (index) => {
    this.setState({
      selectedTab: index,
    });
  };

  componentDidMount() {
    getOverallRanking(1).then((top8UsersOnPage1) => {
      console.log(top8UsersOnPage1);
      this.setState({
        overall: top8UsersOnPage1,
      });
    });
    const region = this.state;
    getRegionalRanking(1, region).then((top8UsersOnPage1) => {
      console.log(top8UsersOnPage1);
      this.setState({
        region: top8UsersOnPage1,
      });
    });
  }

  render() {
    const { overall, region, selectedTab } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar} position="static">
          <Tabs
            value={selectedTab}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            className={classes.tab}
          >
            <Tab label="Overall Ranking" {...a11yProps(0)} />
            <Tab label="Region Ranking" {...a11yProps(1)} />
            <Tab label="Top 5 User" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          index={selectedTab}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabPanel value={selectedTab} index={0}>
            {this.state.overall}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                redirectToPage("/ranking", this.props);
              }}
              className={classes.button}
            >
              See more
            </Button>
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            {this.state.region}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                redirectToPage("/ranking", this.props);
              }}
              className={classes.button}
            >
              See more
            </Button>
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            {this.state.overall.slice(0, 5)}
            {this.state.region.slice(0, 5)}
            <Button
              variant="text"
              size="small"
              color="primary"
              onClick={() => {
                redirectToPage("/ranking", this.props);
              }}
              className={classes.button}
            >
              See more
            </Button>
          </TabPanel>
        </SwipeableViews>
      </div>
    );
  }
}

export default withStyles(styles)(RankingPaper);
