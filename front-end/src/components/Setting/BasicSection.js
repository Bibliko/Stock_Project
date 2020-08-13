import React from "react";

import clsx from "clsx";

import SettingNormalTextField from "../TextField/SettingNormalTextField";
import DatePickerTextField from "../TextField/DatePickerTextField";
import SelectBox from "../SelectBox/SelectBox";

import { withStyles } from "@material-ui/core/styles";

import { Grid, Container, Typography } from "@material-ui/core";

import { MobileDatePicker } from "@material-ui/pickers";

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
  textFieldContainer: {
    maxWidth: "none",
    minWidth: "150px",
    marginLeft: "10px",
    marginRight: "10px",
  },
  title: {
    color: "white",
    fontSize: "20px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "15px",
    },
    paddingLeft: "5px",
    fontWeight: "bold",
  },
});

class BasicSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        firstName: this.props.firstName || "",
        lastName: this.props.lastName || "",
        dateOfBirth: this.props.dateOfBirth || new Date("1 1 1970"),
        gender: this.props.gender || "",
      },
    };
    this.hasError = false;
  }

  reset() {
    this.hasError = false;
    this.setState({
      input: {
        firstName: this.props.firstName || "",
        lastName: this.props.lastName || "",
        dateOfBirth: this.props.dateOfBirth || new Date("1 1 1970"),
        gender: this.props.gender || "",
      },
    });
  }

  createChangeLog(firstName, lastName, dateOfBirth, gender) {
    return { firstName, lastName, dateOfBirth, gender };
  }

  recordFirstName = (event) => {
    const input = { ...this.state.input, firstName: event.target.value };
    this.setState({
      input: input,
    });
    this.hasError = !event.target.value || !this.state.input.lastName;
    this.props.recordChanges(
      this.createChangeLog(
        event.target.value,
        this.state.input.lastName,
        this.state.input.dateOfBirth,
        this.state.input.gender
      )
    );
  };

  recordLastName = (event) => {
    const input = { ...this.state.input, lastName: event.target.value };
    this.setState({
      input: input,
    });
    this.hasError = !this.state.input.firstName || !event.target.value;
    this.props.recordChanges(
      this.createChangeLog(
        this.state.input.firstName,
        event.target.value,
        this.state.input.dateOfBirth,
        this.state.input.gender
      )
    );
  };

  recordDateOfBirth = (newDate) => {
    const input = { ...this.state.input, dateOfBirth: newDate };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(
        this.state.input.firstName,
        this.state.input.lastName,
        newDate,
        this.state.input.gender
      )
    );
  };

  recordGender = (event) => {
    const input = { ...this.state.input, gender: event.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(
        this.state.input.firstName,
        this.state.input.lastName,
        this.state.input.dateOfBirth,
        event.target.value
      )
    );
  };

  handleDateError = () => {
    this.hasError = true;
  };

  handleDateAccept = () => {
    this.hasError = false;
  };

  render() {
    const { input } = this.state;
    const { classes } = this.props;
    const genders = ["Female", "Male", "Other", "Prefer not to say"];

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={2}
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
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <Container className={classes.textFieldContainer}>
              <Typography className={classes.title}>Date of birth</Typography>
              <MobileDatePicker
                disableFuture
                allowKeyboardControl={true}
                reduceAnimations={true}
                toolbarPlaceholder="Enter Date"
                openTo="year"
                inputFormat="dd/MM/yyyy"
                views={["year", "month", "date"]}
                value={input.dateOfBirth}
                onChange={this.recordDateOfBirth}
                onError={this.handleDateError}
                onAccept={this.handleDateAccept}
                renderInput={(props) => <DatePickerTextField {...props} />}
              />
            </Container>
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SelectBox
              name="Gender"
              value={input.gender}
              items={genders}
              onChange={this.recordGender}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(BasicSection);