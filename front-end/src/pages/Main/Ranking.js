import React from "react";
import { isEqual } from "lodash";
import clsx from "clsx";
import { withRouter } from "react-router";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import MyStatsTable from "../../components/Table/RankingTable/MyStatsTable";
import OverallTable from "../../components/Table/RankingTable/OverallTable";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: "100px",
    [theme.breakpoints.down("xs")]: {
      width: "85%",
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  gridTitle: {
    fontSize: "x-large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1px",
  },
  titleLabel: {
    color: "#DC3D4A",
  },
  statistic: {
    color: "#619FD7",
  },
  textField: {
    height: "50px",
    width: "100%",
    margin: "8px",
    fontWeight: "normal",
    "& label.Mui-focused": {
      color: "black",
    },
    "& .MuiFilledInput-underline:after": {
      borderBottom: "2px solid #000000",
    },
    "& .MuiFilledInput-root": {
      "&.Mui-focused": {
        backgroundColor: "rgba(225,225,225,0.5)",
      },
    },
  },
  select: {
    color: "black",
    backgroundColor: "rgba(225,225,225,0.95)",
    "&:hover": {
      backgroundColor: "rgba(225,225,225,0.75)",
    },
    "& input": {
      backgroundColor: "rgba(225,225,225,0)",
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

  componentDidMount() {
    console.log(this.props.userSession);
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
            <Typography className={clsx(classes.gridTitle, classes.titleLabel)}>
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
              }}
            >
              {levels.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.titleLabel)}>
              Overall Ranking
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.itemGrid} align="center">
            <OverallTable />
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <Typography className={clsx(classes.gridTitle, classes.statistic)}>
              My Stats
            </Typography>
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
