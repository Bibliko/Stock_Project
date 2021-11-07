import React from "react";
import { withRouter } from "react-router";

import { withTranslation } from "react-i18next";

import { Typography, Avatar } from "@material-ui/core";
import { redirectToPage } from "../../../utils/low-dependency/PageRedirectUtil";
import { getOverallRanking, getUserData } from "../../../utils/UserUtil";
import { withStyles } from "@material-ui/core/styles";

import HomePageRankingTable from "../../Table/RankingTable/HomePageRankingTable";

const styles = (theme) => ({
  root: {
    width: "100%",
    height: "100%",
  },
  title: {
    cursor: "pointer",
    fontSize: "x-large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "12px",
    color: theme.palette.primary.main,
    "&:hover": {
      color: theme.palette.primary.hover,
    },
  },
  rank: {
    fontSize: "20px",
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
    },
    fontWeight: "bold",
    color: theme.palette.secondary.main,
  },
  name: {
    fontSize: "18px",
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
    },
    fontWeight: "300",
    color: theme.palette.secondary.main,
  },
  portfolioValue: {
    fontSize: "14px",
    [theme.breakpoints.down("sm")]: {
      fontSize: "13px",
    },
    fontWeight: "light",
    color: "gray",
  },
  topUser: {
    width: "100%",
    marginTop: "20px",
    marginBottom: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "120px",
    height: "120px",
    [theme.breakpoints.down("sm")]: {
      width: "105px",
      height: "105px",
    },
    border: "4px solid",
    borderColor: theme.palette.primary.subDark,
    boxShadow: "0px 3px 20px 5px " + theme.palette.primary.transparentHover,
  },
  firstPlace: {
    transform: "scale(1.2)",
    zIndex: "5",
  },
  footer: {
    cursor: "pointer",
    padding: "7px",
    fontSize: "small",
    color: "white",
    "&:hover": {
      textDecoration: "underline",
      color: theme.palette.normalFontColor.secondary,
    },
  },
});

function avatarFrame (user, rank, classes) {
  if (!user) return;

  const position = ["1st", "2nd", "3rd"];
  const { avatarUrl, firstName, lastName, totalPortfolio } = user;
  const fullName = firstName + " " + lastName;

  return (
    <React.Fragment>
      <Typography align="center" className={classes.rank}> {position[rank]} </Typography>
      <Avatar
          src={avatarUrl}
          className={classes.avatar}
      />
      <Typography align="center" className={classes.name}> {fullName} </Typography>
      <Typography align="center" className={classes.portfolioValue}> {`$${totalPortfolio}`} </Typography>
    </React.Fragment>
  )
}

class RankingPaper extends React.Component {
  state = {
    top3Users: [],
    top4To8Users: [],
  };

  componentDidMount() {
    getOverallRanking(1)
      .then((top8Users) => {
        let top3Users = top8Users.slice(0, 3);
        const dataNeeded = {
          avatarUrl: true,
        };

        return Promise.all([
          top3Users,
          top8Users.slice(3, 8),
          // Get avatarUrls of top 3 users
          getUserData(dataNeeded, top3Users[0].email),
          getUserData(dataNeeded, top3Users[1].email),
          getUserData(dataNeeded, top3Users[2].email)
        ]);
      })
      .then(([top3Users, top4To8Users, ...top3UsersAvatar]) => {
        // attach avatarUrl to top3Users
        top3Users.forEach((user, id) => {
          user.avatarUrl = top3UsersAvatar[id].avatarUrl;
        });

        this.setState({
          top3Users: top3Users,
          top4To8Users: top4To8Users
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const { top3Users, top4To8Users } = this.state;
    const { t, classes } = this.props;

    return (
      <div className={classes.root}>
        <Typography
          className={classes.title}
          onClick={() => {redirectToPage("/ranking", this.props);}}
        >
          {t("ranking.ranking")}
        </Typography>

        <div className={classes.topUser}>
          <div style={{transform: "translateX(15px) translateY(10px)"}}>
            {avatarFrame(top3Users[1], 1, classes)}
          </div>

          <div className={classes.firstPlace}>
            {avatarFrame(top3Users[0], 0, classes)}
          </div>

          <div style={{transform: "translateX(-15px) translateY(10px)"}}>
            {avatarFrame(top3Users[2], 2, classes)}
          </div>
        </div>

        <HomePageRankingTable users={top4To8Users} />

        <Typography
          className={classes.footer}
          onClick={() => {redirectToPage("/ranking", this.props);}}
          align={"right"}
        >
          {t("ranking.viewFullRanking")}
        </Typography>
      </div>
    );
  }
}

export default withTranslation()(withStyles(styles)(withRouter(RankingPaper)));
