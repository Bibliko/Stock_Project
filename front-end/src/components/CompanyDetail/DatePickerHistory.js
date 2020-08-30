import React from "react";
//import { isEqual } from "lodash";
import clsx from "clsx";

import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
//import Grid from "@material-ui/core/Grid";
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
} from "@material-ui/pickers";
import { MobileDatePicker } from "@material-ui/pickers";
import DatePickerTextField from "./DatePickerTextField";
import {
  DateRangePicker,
  DateRangeDelimiter,
} from "@material-ui/pickers";
import { Grid, Container, Typography } from "@material-ui/core";

const styles = (theme) => ({
  gridContainer: {
    marginBottom: "30px",
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "15px",
      marginTop: "10px",
    },
  },
  textFieldContainer: {
    maxWidth: "none",
    minWidth: "150px",
    marginLeft: "10px",
    marginRight: "10px",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minWidth: "150px",
  },
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
  constructor(props) {
    super(props);
    this.state = {
      input: {
        date: this.props.date,
      },
    };
    //this.hasError = false;
    //this.isInvalidDate = false;
  }
  createChangeLog(date) {
    return { date };
  }
  setDate = (newDate) => {
    const input = { ...this.state.input, date: newDate };
    this.setState({
      input: input,
    });
    //this.props.recordChanges(this.createChangeLog(newDate));
  };
  handleChange = (date) => {
    this.setState({
      setDate: date,
    });
  };
  render() {
    const { classes } = this.props;
    const { input } = this.state;

    return (
      <DatePicker
        id={this.props.name}
        name={this.props.name}
        label={this.props.name}
        disableFuture
        allowKeyboardControl={true}
        reduceAnimations={false}
        toolbarPlaceholder="Enter Date"
        openTo="date"
        inputFormat="dd/MM/yyyy"
        views={["date", "month"]}
        value={input.date}
        onChange={this.setDate}
        //onError={this.handleDateError}
        renderInput={(props) => <DatePickerTextField {...props} />}
      />
    );
  }
}

export default withStyles(styles)(DatePickerHistory);
