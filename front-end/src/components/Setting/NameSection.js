import React from "react";

import clsx from "clsx";

import SettingNormalTextField from "../TextField/SettingNormalTextField";

import { withStyles } from "@material-ui/core/styles";

import Grid from '@material-ui/core/Grid';

const styles = (theme) => ({
  gridContainer: {
    marginBottom: "30px",
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "15px",
      marginTop: "10px",
    },
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minWidth: "150px",
  },
});

class NameSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        firstName: this.props.firstName || "",
        lastName: this.props.lastName || "",
      },
    };
    this.hasError = false;
    this.recordFirstName = this.recordFirstName.bind(this);
    this.recordLastName = this.recordLastName.bind(this);
  }

  reset() {
    this.setState({
      input: {
        firstName: this.props.firstName,
        lastName: this.props.lastName,
      },
    });
  }

  createChangeLog(firstName, lastName) {
    return { firstName, lastName };
  }

  recordFirstName(e) {
    const input = { ...this.state.input, firstName: e.target.value };
    this.setState({
      input: input,
    });
    this.hasError = !e.target.value || !this.state.input.lastName;
    this.props.recordChanges(
      this.createChangeLog(e.target.value, this.state.input.lastName)
    );
  }

  recordLastName(e) {
    const input = { ...this.state.input, lastName: e.target.value };
    this.setState({
      input: input,
    });
    this.hasError = !this.state.input.firstName || !e.target.value;
    this.props.recordChanges(
      this.createChangeLog(this.state.input.firstName, e.target.value)
    );
  }

  render() {
    const { input } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={4}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SettingNormalTextField
              name="First name"
              value={input.firstName}
              isInvalid={!input.firstName}
              helper="Cannot be empty"
              onChange={this.recordFirstName}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SettingNormalTextField
              name="Last name"
              value={input.lastName}
              isInvalid={!input.lastName}
              helper="Cannot be empty"
              onChange={this.recordLastName}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(NameSection);
