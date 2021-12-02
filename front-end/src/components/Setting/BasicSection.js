import React from "react";
import clsx from "clsx";

import { withTranslation } from "react-i18next";

import SettingNormalTextField from "../TextField/SettingTextFields/SettingNormalTextField";
import DatePickerTextField from "../TextField/DatePickerTextFields/SettingDatePickerTextField";
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
  fullWidth: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    marginBottom: "10px",
  },
  textFieldContainer: {
    maxWidth: "none",
    minWidth: "150px",
    marginLeft: "10px",
    marginRight: "10px",
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  title: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
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
        dateOfBirth: this.props.dateOfBirth,
        gender: this.props.gender || "",
      },
    };
    this.hasError = false;
    this.isInvalidDate = false;
  }

  reset() {
    this.hasError = false;
    this.isInvalidDate = false;
    this.setState({
      input: {
        firstName: this.props.firstName || "",
        lastName: this.props.lastName || "",
        dateOfBirth: this.props.dateOfBirth,
        gender: this.props.gender || "",
      },
    });
  }

  createChangeLog(firstName, lastName, dateOfBirth, gender) {
    return { firstName, lastName, dateOfBirth, gender };
  }

  checkForError(firstName, lastName) {
    this.hasError = !firstName || !lastName || this.isInvalidDate;
  }

  recordFirstName = (event) => {
    const input = { ...this.state.input, firstName: event.target.value };
    this.setState({
      input: input,
    });
    this.checkForError(event.target.value, input.lastName);
    this.props.recordChanges(
      this.createChangeLog(
        event.target.value,
        input.lastName,
        input.dateOfBirth,
        input.gender
      )
    );
  };

  recordLastName = (event) => {
    const input = { ...this.state.input, lastName: event.target.value };
    this.setState({
      input: input,
    });
    this.checkForError(input.firstName, event.target.value);
    this.props.recordChanges(
      this.createChangeLog(
        input.firstName,
        event.target.value,
        input.dateOfBirth,
        input.gender
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

  handleDateError = (error) => {
    this.isInvalidDate = !!error;
    this.checkForError(this.state.input.firstName, this.state.input.lastName);
  };

  componentDidMount() {
    this.props.reference.current = this;
  }

  componentWillUnmount() {
    this.props.reference.current = null;
  }

  render() {
    const { input } = this.state;
    const { t, classes } = this.props;
    const genders = ["Female", "Male", "Other", "Prefer not to say"];

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={4}
          direction="row"
          className={clsx(classes.fullWidth, classes.gridContainer)}
        >
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SettingNormalTextField
              name={t("settings.firstName")}
              value={input.firstName}
              isInvalid={!input.firstName}
              helper={t("settings.noEmpty")}
              onChange={this.recordFirstName}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SettingNormalTextField
              name={t("settings.lastName")}
              value={input.lastName}
              isInvalid={!input.lastName}
              helper={t("settings.noEmpty")}
              onChange={this.recordLastName}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <Container className={classes.textFieldContainer}>
              <Typography className={classes.title}>
                {t("settings.DOB")}
              </Typography>
              <MobileDatePicker
                disableFuture
                allowKeyboardControl={true}
                reduceAnimations={false}
                toolbarPlaceholder="Enter Date"
                openTo="year"
                inputFormat="dd/MM/yyyy"
                views={["year", "month", "date"]}
                value={input.dateOfBirth}
                onChange={this.recordDateOfBirth}
                onError={this.handleDateError}
                renderInput={(props) => <DatePickerTextField {...props} />}
              />
            </Container>
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SelectBox
              name={t("settings.gender")}
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

export default withTranslation()(
  withStyles(styles)(BasicSection)
);
