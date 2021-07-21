import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { isEqual } from "lodash";

import ProgressButton from "../../Button/ProgressButton";

import {
  Button,
  Divider,
  Paper,
  Typography
} from "@material-ui/core";

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    flexFlow: "row wrap",
    gap: "0.7rem",
    width: "100%",
  },
  paper: {
    display: "flex",
    flexFlow: "row wrap",
    flexBasis: "100%",
    backgroundColor: theme.palette.paperBackground.onPage,
    color: theme.palette.normalFontColor.primary,
    borderRadius: "4px",
    width: "100%",
    padding: "1.2rem 1.5rem 1.4rem 1.5rem",
  },
  title: {
    flexBasis: "100%",
    fontSize: "x-large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginBottom: "1rem",
    color: theme.palette.primary.main,
  },
  label: {
    flexBasis: "50%",
    marginTop: "0.6rem",
    fontWeight: "bold",
    fontSize: "1.25em",
    letterSpacing: "0.04em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.15em",
      letterSpacing: "initial"
    },
  },
  content: {
    flexBasis: "50%",
    marginTop: "0.6rem",
    fontSize: "1.25em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.15em",
    },
  },
  divider: {
    flexBasis: "100%",
    margin: "2rem 0 1rem 0",
    background: "white",
  },
  buttonContainer: {
    flexGrow: "1",
    width: "unset",
    color: theme.palette.normalFontColor.primary,
  },
});

class OrderSummary extends React.Component {
  state = {
  };

  componentDidMount() {
  }

  componentWillUnmount() {}

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.classes, this.props.classes) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography className={classes.title}>{"Order Summary"}</Typography>

          <Typography className={classes.label}>{"Type:"}</Typography>
          <Typography className={classes.content}>{"content"}</Typography>

          <Typography className={classes.label}>{"Code:"}</Typography>
          <Typography className={classes.content}>{"content"}</Typography>

          <Typography className={classes.label}>{"Quantity:"}</Typography>
          <Typography className={classes.content}>{"content"}</Typography>

          <Typography className={classes.label}>{"Brokerage:"}</Typography>
          <Typography className={classes.content}>{"content"}</Typography>

          <Divider variant="middle" className={classes.divider} />

          <Typography className={classes.label}>{"Total:"}</Typography>
          <Typography className={classes.content}>{"content"}</Typography>
        </Paper>

        <Button
          aria-label="Clear"
          variant="outlined"
          disableElevation
          color="primary"
          className={classes.buttonContainer}
        >
          {"Clear"}
        </Button>

        <ProgressButton
          containerClass={classes.buttonContainer}
        >
          {"Submit"}
        </ProgressButton>
      </div>
    );
  }
}

OrderSummary.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OrderSummary);
