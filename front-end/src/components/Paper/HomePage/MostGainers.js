import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { isEqual } from "lodash";

import { getCachedMostGainers } from "../../../utils/RedisUtil";

import MostGainersCard from "../../Card/MostGainers";

import { MenuList, MenuItem, Paper, Typography } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    width: "100%",
    maxHeight: "400px",
    maxWidth: theme.customWidth.maxMostGainers,
    alignSelf: "center",
  },
  paper: {
    backgroundColor: theme.palette.paperBackground.onPage,
    color: theme.palette.normalFontColor.primary,
    borderRadius: "4px",
    width: "100%",
    height: "100%",
  },
  menuList: {
    width: "100%",
    maxWidth: theme.customWidth.maxMostGainers,
    maxHeight: "400px",
    overflow: "auto",
  },
  title: {
    fontSize: "large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "medium",
    },
    fontWeight: "bold",
    marginBottom: "12px",
    color: theme.palette.primary.main,
  },
  menuItem: {
    "&:hover": {
      backgroundColor: theme.palette.menuItemHover.main,
      boxShadow: theme.customShadow.popup,
    },
    minHeight: theme.customHeight.mostGainersCard,
    display: "flex",
    justifyContent: "center",
  },
});

class MostGainers extends React.Component {
  state = {
    gainers: [],
  };

  componentDidMount() {
    getCachedMostGainers()
      .then((gainers) => {
        console.log(gainers);
        this.setState({
          gainers,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentWillUnmount() {}

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.classes, this.props.classes) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes, title } = this.props;
    const { gainers } = this.state;

    return (
      <div className={classes.root}>
        <Typography className={classes.title}>{title}</Typography>
        <Paper className={classes.paper}>
          <MenuList className={classes.menuList}>
            {gainers.slice(0, 10).map((gainer, index) => (
              <MenuItem key={index} className={classes.menuItem}>
                <MostGainersCard gainer={gainer} />
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </div>
    );
  }
}

MostGainers.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
};

export default withStyles(styles)(MostGainers);
