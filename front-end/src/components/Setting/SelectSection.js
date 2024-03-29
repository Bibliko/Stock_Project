import React from "react";
import clsx from "clsx";

import { withTranslation } from "react-i18next";

import SelectBox from "../SelectBox/SelectBox";
import SpaceDivMainPages from "../Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";

import { Grid } from "@material-ui/core";

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
  },
});

class SelectSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        region: this.props.region || "",
        occupation: this.props.occupation || "",
      },
    };
  }

  reset() {
    this.setState({
      input: {
        region: this.props.region,
        occupation: this.props.occupation,
      },
    });
  }

  createChangeLog(region, occupation) {
    return { region, occupation };
  }

  recordRegion = (event) => {
    const input = { ...this.state.input, region: event.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(event.target.value, this.state.input.occupation)
    );
  };

  recordOccupation = (event) => {
    const input = { ...this.state.input, occupation: event.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(this.state.input.region, event.target.value)
    );
  };

  componentDidMount() {
    this.props.reference.current = this;
  }

  componentWillUnmount() {
    this.props.reference.current = null;
  }

  render() {
    const { t, classes } = this.props;
    const { input } = this.state;
    const occupations = ["Student", "Teacher", "Other"];
    const regions = [
      "Africa",
      "Asia",
      "The Caribbean",
      "Central America",
      "Europe",
      "North America",
      "Oceania",
      "South America",
    ];

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={4}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SelectBox
              name={t("settings.region")}
              value={input.region ? input.region : ""}
              items={regions}
              onChange={this.recordRegion}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.itemGrid}>
            <SelectBox
              name={t("settings.occupation")}
              value={input.occupation ? input.occupation : ""}
              items={occupations}
              onChange={this.recordOccupation}
            />
          </Grid>
          <SpaceDivMainPages />
        </Grid>
      </div>
    );
  }
}

export default withTranslation()(
  withStyles(styles)(SelectSection)
);
