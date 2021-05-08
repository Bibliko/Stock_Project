import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { roundNumber } from "../../utils/low-dependency/NumberUtil";

import { withStyles } from "@material-ui/core/styles";
import { Typography, Chip, Grid } from "@material-ui/core";

const styles = (theme) => ({
  card: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: theme.customWidth.maxMostGainers,
    minheight: theme.customHeight.mostGainersCard,
  },
  chip: {
    width: theme.customWidth.maxMostGainersChip,
    fontWeight: "bold",
  },
  increase: {
    backgroundColor: theme.palette.secondary.hover,
    color: theme.palette.secondary.main,
  },
  decrease: {
    backgroundColor: theme.palette.fail.hover,
    color: theme.palette.fail.main,
  },
  leftGrid: {
    display: "flex",
    justifyContent: "flex-end",
  },
  centerGrid: {
    display: "flex",
    justifyContent: "center",
  },
  boldFont: {
    fontWeight: "bold",
    fontSize: "small",
    [theme.breakpoints.down("xs")]: {
      fontSize: "smaller",
    },
  },
});

class MostGainersCard extends React.Component {
  /**
   * @param {string} changesPercentage (+131.00%)
   * @returns {string} Percentage inside
   */
  gainerChangesPercentage = (changesPercentage) => {
    return changesPercentage.substring(
      changesPercentage.indexOf("(") + 1,
      changesPercentage.indexOf(")")
    );
  };

  render() {
    const { classes, gainer } = this.props;

    return (
      <Grid container spacing={2} direction="row" className={classes.card}>
        <Grid item xs={4}>
          <Typography className={classes.boldFont}>{gainer.ticker}</Typography>
        </Grid>
        <Grid item xs={4} className={classes.centerGrid}>
          <Chip
            className={clsx(classes.chip, {
              [classes.increase]:
                this.gainerChangesPercentage(gainer.changesPercentage).charAt(
                  0
                ) === "+",
              [classes.decrease]:
                this.gainerChangesPercentage(gainer.changesPercentage).charAt(
                  0
                ) === "-",
            })}
            size="medium"
            label={this.gainerChangesPercentage(gainer.changesPercentage)}
          />
        </Grid>
        <Grid item xs={4} className={classes.leftGrid}>
          <Typography className={classes.boldFont}>{`$${roundNumber(
            gainer.prices,
            2
          )}`}</Typography>
        </Grid>
      </Grid>
    );
  }
}

MostGainersCard.propTypes = {
  classes: PropTypes.object.isRequired,
  gainer: PropTypes.object.isRequired,
};

export default withStyles(styles)(MostGainersCard);
