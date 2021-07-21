import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { isEqual } from "lodash";

import SelectBox from "../../SelectBox/SelectBox";
import TextField from "../../TextField/SettingTextFields/SettingNormalTextField";

import {
  Button,
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
  title: {
    flexBasis: "100%",
    fontSize: "x-large",
    [theme.breakpoints.down("sm")]: {
      fontSize: "large",
    },
    fontWeight: "bold",
    marginLeft: "0.6rem",
    marginBottom: "1rem",
    color: theme.palette.secondary.main,
  },
  field: {
    flex: "1 1 45%",
    [theme.breakpoints.down("sx")]: {
      flex: "1 1 100%",
    },
  },
});

class OrderForm extends React.Component {
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
        <Typography className={classes.title}>{"Order's details"}</Typography>
        <SelectBox
          name={"Type"}
          items={[]}
          style={{flexBasis: "100%"}}
        />
        <TextField
          containerClass={classes.field}
          name={"Code"}
        />
        <TextField
          containerClass={classes.field}
          name={"Quantity"}
        />
        <SelectBox
          containerClass={classes.field}
          name={"Option"}
          items={[]}
        />
        <TextField
          containerClass={classes.field}
          name={"Price"}
        />
      </div>
    );
  }
}

OrderForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OrderForm);
