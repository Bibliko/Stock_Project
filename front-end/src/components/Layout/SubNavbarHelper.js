import React from "react";
import PropTypes from "prop-types";

import {
  Slide,
  useScrollTrigger,
} from "@material-ui/core";

import { roundNumber } from "../../utils/low-dependency/NumberUtil";

export function HideOnScroll(props) {
  const {
    children,
  } = props;
  const trigger = useScrollTrigger({threshold: 10});
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}
HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

export const getTopShare = (shares, secondMostActiveStock) => {
	return (shares.length !== 0
		? shares.sort((firstShare, secondShare) => {
    	return secondShare.quantity * secondShare.buyPriceAvg - firstShare.quantity * firstShare.buyPriceAvg;  // sorted by value
  	})[0].companyCode
  	: secondMostActiveStock.ticker);  // default to second most active stock
};

export const processExchangeData = (data, exchange, exchangeHistorical) => {
  const currentDay = exchangeHistorical[0].date.slice(8, 10);  // extract current day from dateTime string. Example: "2021-01-05 15:00:00".slice(8, 10) === "05"
  const currentValue = exchangeHistorical[0].close;
  const lastValue = exchangeHistorical.find((data) => data.date.slice(8, 10) !== currentDay).close;
  data.push([
    exchange,
    roundNumber(currentValue, 2),
    roundNumber((currentValue - lastValue) / lastValue * 100, 1)
  ]);
};

export const processCompanyData = (data, companyInfo) => {
  data.push([
    companyInfo.symbol,
    roundNumber(companyInfo.price, 2),
    roundNumber(companyInfo.changesPercentage, 1)
  ]);
};

export default {
	HideOnScroll,
	getTopShare,
	processExchangeData,
	processCompanyData,
};