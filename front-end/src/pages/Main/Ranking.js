import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import MyStatsTable from "../../components/Table/RankingTable/MyStatsTable";
import OverallTable from "../../components/Table/RankingTable/OverallTable";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
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
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    maxWidth: "none",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
    padding: "24px",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  gridTitle: {
    fontSize: "x-large",
    color: theme.palette.primary.main,
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1px",
  },
  textField: {
    width: "100%",
    margin: "8px",
    fontWeight: "normal",
    "& label": {
      color: theme.palette.normalFontColor.secondary,
      "&.Mui-focused": {
        color: theme.palette.secondary.main,
      },
    },
    "& .MuiFilledInput-underline:after": {
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
    "& .MuiFilledInput-root": {
      "&.Mui-focused": {
        backgroundColor: theme.palette.paperBackground.onPageSuperLight,
      },
    },
  },
  selectIcon: {
    color: theme.palette.normalFontColor.secondary,
  },
  select: {
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    "&:hover": {
      backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    },
    "& input": {
      backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    },
  },
  menuItem: {
    "&:hover": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
    "&.MuiListItem-root": {
      "&.Mui-selected": {
        backgroundColor: theme.palette.menuItemHover.main,
      },
    },
  },
});

const levels = [
  {
    value: "Overall",
    label: "Overall Ranking",
  },
  {
    value: "Regional",
    label: "Regional Ranking",
  },
];

class Ranking extends React.Component {
  state = {
    rankingLevel: "Overall",
  };

  changeRankingLevel = (event) => {
    if (!isEqual(this.state.rankingLevel, event.target.value)) {
      this.setState({
        rankingLevel: event.target.value,
      });
    }
  };

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
    const { classes } = this.props;

    const { rankingLevel } = this.state;

    const {
      overallRank,
      regionRank,
      portfolioValue,
      previousWeek,
      portfolioHigh,
    } = this.props.userSession;

    return (
      <Container className={classes.root} disableGutters>
        <Grid
          container
          spacing={4}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={classes.gridTitle}>
              Choose a ranking level
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.center} align="left">
            <TextField
              className={classes.textField}
              id="Ranking"
              select
              label="Ranking level"
              value={rankingLevel}
              onChange={this.changeRankingLevel}
              variant="filled"
              SelectProps={{
                className: classes.select,
                classes: {
                  icon: classes.selectIcon,
                },
              }}
            >
              {levels.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  className={classes.menuItem}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={classes.gridTitle}>
              Overall Ranking
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid} align="center">
            <OverallTable />
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={classes.gridTitle}>My Stats</Typography>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid} align="center">
            <MyStatsTable
              overallRank={overallRank}
              regionRank={regionRank}
              portfolioValue={portfolioValue}
              previousWeek={previousWeek}
              portfolioHigh={portfolioHigh}
            />
          </Grid>
          <SpaceDivMainPages />
        </Grid>
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
)(withStyles(styles)(withRouter(Ranking)));
