import React from "react";
import clsx from "clsx";

import { withTranslation } from "react-i18next";

import { withStyles } from "@material-ui/core/styles";

import { Slider, Typography, Tooltip, Grid } from "@material-ui/core";

import { simplifyNumber } from "../../utils/low-dependency/NumberUtil";
import { fmpSector, fmpIndustry } from "../../utils/low-dependency/FmpHelper";
import SelectBox from "../SelectBox/SelectBox";

const styles = (theme) => ({
  fullWidth: {
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  container: {
    color: "white",
  },
  label: {
    fontSize: "medium",
    fontWeight: "bold",
    marginBottom: "5px",
    textAlign: "left",
  },
  sectorSelectBox: {
    marginLeft: "-10px",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "-15px",
    },
  },
  industrySelectBox: {
    marginLeft: "-10px",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "1px",
    },
  },
});

const CustomTooltip = withStyles((theme) => ({
  tooltip: {
    fontSize: "12px",
    backgroundColor: theme.palette.primary.main,
  },
  arrow: {
    color: theme.palette.primary.main,
  },
}))(Tooltip);

const CustomSlider = withStyles((theme) => ({
  markLabel: {
    color: theme.palette.primary.main,
    fontSize: "15px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "11px",
    },
  },
}))(Slider);

class Filter extends React.Component {
  valueLabelFormat = (value) => {
    return simplifyNumber(value);
  };

  ValueLabelComponent = (props) => {
    const { children, open, value } = props;

    return (
      <CustomTooltip
        arrow
        open={open}
        enterTouchDelay={0}
        placement="top"
        title={value}
      >
        {children}
      </CustomTooltip>
    );
  };

  render() {
    const {
      t,
      classes,
      price,
      marketCap,
      sector,
      industry,
      getPrice,
      getMarketCap,
      handleChange,
    } = this.props;

    const marks = {
      price: [
        {
          value: -250,
          label: "$0",
        },
        {
          value: 1000,
          label: "$320K",
        },
      ],
      marketCap: [
        {
          value: 250,
          label: "$1K",
        },
        {
          value: 1040,
          label: "$3T",
        },
      ],
    };
    const sectors = fmpSector;
    const industries = fmpIndustry;

    return (
      <Grid
        container
        spacing={4}
        direction="row"
        className={clsx(classes.fullWidth, classes.container)}
      >
        <Grid item xs={6} sm={12} className={classes.itemGrid}>
          <Typography className={classes.label}>
            {t("general.price")}
          </Typography>
          <CustomSlider
            value={price}
            min={-250}
            max={1000}
            scale={getPrice}
            onChange={(event, value) => handleChange("price", value)}
            valueLabelDisplay="auto"
            getAriaValueText={this.valueLabelFormat}
            valueLabelFormat={this.valueLabelFormat}
            className={classes.slider}
            marks={marks.price}
            ValueLabelComponent={this.ValueLabelComponent}
          />
        </Grid>
        <Grid item xs={6} sm={12} className={classes.itemGrid}>
          <Typography className={classes.label}>
            {t("general.marketCap")}
          </Typography>
          <CustomSlider
            value={marketCap}
            min={250}
            max={1040}
            step={10}
            scale={getMarketCap}
            onChange={(event, value) => handleChange("marketCap", value)}
            valueLabelDisplay="auto"
            getAriaValueText={this.valueLabelFormat}
            valueLabelFormat={this.valueLabelFormat}
            className={classes.slider}
            marks={marks.marketCap}
            ValueLabelComponent={this.ValueLabelComponent}
          />
        </Grid>
        <Grid
          item
          xs={6}
          sm={12}
          className={clsx(classes.sectorSelectBox, classes.itemGrid)}
        >
          <SelectBox
            name={t("general.sector")}
            items={sectors}
            value={sector}
            emptyLabel={"All"}
            onChange={(event) => handleChange("sector", event.target.value)}
          />
        </Grid>
        <Grid
          item
          xs={6}
          sm={12}
          className={clsx(classes.industrySelectBox, classes.itemGrid)}
        >
          <SelectBox
            name={t("general.industry")}
            items={industries}
            value={industry}
            emptyLabel={"All"}
            onChange={(event) => handleChange("industry", event.target.value)}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withTranslation()(withStyles(styles)(Filter));
