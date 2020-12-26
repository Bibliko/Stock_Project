import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";

import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  container: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    height: "20px",
    width: "100px",
  },
  rectangle: {
    width: "10px",
    height: "10px",
    transition: "background-color 0.1s linear",
  },
});

class SegmentedBar extends React.Component {
  state = {
    colorWhiteArray: [
      // themeObj palette secondary main
      "rgba(102, 189, 219, 0.2)",
      "rgba(102, 189, 219, 0.4)",
      "rgba(102, 189, 219, 0.6)",
      "rgba(102, 189, 219, 0.8)",
    ],
  };

  intervalChangeColorArray;

  componentDidMount() {
    this.intervalChangeColorArray = setInterval(() => {
      let tempArray = this.state.colorWhiteArray;
      tempArray.unshift(tempArray.pop());

      this.setState({
        colorWhiteArray: tempArray,
      });
    }, oneSecond / 6);
  }

  componentWillUnmount() {
    clearInterval(this.intervalChangeColorArray);
  }

  render() {
    const { classes, className } = this.props;
    const { colorWhiteArray } = this.state;

    return (
      <div className={clsx(classes.container, className)}>
        <div
          className={classes.rectangle}
          style={{
            backgroundColor: colorWhiteArray[0],
          }}
        />
        <div
          className={classes.rectangle}
          style={{
            backgroundColor: colorWhiteArray[1],
          }}
        />
        <div
          className={classes.rectangle}
          style={{
            backgroundColor: colorWhiteArray[2],
          }}
        />
        <div
          className={classes.rectangle}
          style={{
            backgroundColor: colorWhiteArray[3],
          }}
        />
      </div>
    );
  }
}

SegmentedBar.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default withStyles(styles)(withRouter(SegmentedBar));
