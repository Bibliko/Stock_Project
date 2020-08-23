import React from "react";
//import { isEqual } from "lodash";
import { withRouter } from "react-router";
//import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
//import Grid from "@material-ui/core/Grid";
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@material-ui/pickers";
import { MobileDatePicker } from "@material-ui/pickers";
import DatePickerTextField from "../TextField/DatePickerTextField";
import { DateRangePicker } from "@material-ui/pickers";

import DateFnsUtils from "@date-io/date-fns";
//import DatePicker from "react-datepicker";
const styles = (theme) => ({
  setDate: {
    //backgroundColor: "white",
    height: 50,
    margin: "10px",
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
  input: {
    color: "black",
    backgroundColor: "rgba(225,225,225,0.65)",
    "&:hover": {
      backgroundColor: "rgba(225,225,225,0.5)",
    },
    "& input": {
      backgroundColor: "rgba(225,225,225,0)",
    },
  },
});

class DatePickerHistory extends React.Component {
  state = {
    startDate: new Date(),
  };

  handleChange = (date) => {
    this.setState({
      startDate: date,
    });
  };
  render() {
    const { classes } = this.props;

    return (
      <DatePicker
        disableFuture
        allowKeyboardControl={true}
        reduceAnimations={false}
        toolbarPlaceholder="Enter Date"
        openTo="year"
        inputFormat="dd/MM/yyyy"
        views={["year", "month", "date"]}
        value={this.state.startDate}
        onChange={this.handleChange}
        //onError={this.handleDateError}
        renderInput={(props) => <DatePickerTextField {...props} />}
      />
    );
  }
}

export default withStyles(styles)(withRouter(DatePickerHistory));
