import React, { createRef } from "react";
import clsx from "clsx";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router";

import { withMediaQuery } from "../../theme/ThemeUtil";
import { ComponentWithForwardedRef } from "../../utils/ComponentUtil";
import { oneSecond } from "../../utils/DayTimeUtil";
import { searchCompanyTickers } from "../../utils/FinancialModelingPrepUtil";
import { redirectToPage } from "../../utils/PageRedirectUtil";

import SearchPopper from "./SearchPopper";
import SearchField from "./SearchField";

import { withStyles } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";

import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

const styles = (theme) => ({
  searchFieldMotherContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: theme.customWidth.maxSearchFieldWithLogo,
    [theme.breakpoints.down("xs")]: {
      width: "unset",
    },
    paddingLeft: "10px",
  },
  searchFieldContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
    width: theme.customWidth.maxSearchFieldWidth,
    opacity: 1,
    transition: "width 0.3s, opacity 0.25s ease-in 0.1s",
    zIndex: theme.customZIndex.searchFieldContainer,
  },
  extendWidthSearchField: {
    width: "100%",
    opacity: 1,
  },
  searchIcon: {
    color: "rgba(156, 140, 249, 1)",
  },
  iconButton: {
    left: "85px",
    backgroundColor: "rgba(156, 140, 249, 0.3)",
    "&:hover": {
      backgroundColor: "rgba(156, 140, 249, 0.4)",
    },
    "& .MuiTouchRipple-root span": {
      backgroundColor: "rgba(156, 140, 249, 0.6)",
    },
    position: "absolute",
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    opacity: 1,
    transition: "left 0.2s ease-in-out, opacity 0.25s ease-in",
  },
  logo: {
    left: "10px",
    position: "absolute",
    height: "50px",
    [theme.breakpoints.down("xs")]: {
      height: "30px",
    },
    "&:hover": {
      cursor: "pointer",
    },
    opacity: 1,
    transition: "opacity 0.2s ease-in",
  },
  hideFade: {
    opacity: 0,
  },
  hideFadeIcon: {
    opacity: 0,
    left: "5px",
  },
  hideSearchBar: {
    width: "0%",
    opacity: 0,
    padding: 0,
    position: "absolute",
    left: "-100%",
  },
  hideCompletely: {
    display: "none",
  },
});

const NYSE = [
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
];

const NASDAQ = [
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name: "asdf",
    currency: "USD",
    exchangeShortName: "asdf",
  },
  {
    symbol: "asdf",
    name:
      "LightInTheBox Holding Co. Ltd. American Depositary Shares each representing 2",
    currency: "USD",
    exchangeShortName: "asdf",
  },
];

class SearchFieldLayout extends React.Component {
  state = {
    openSearchMenu: false,
    searchCompany: "",
    companiesNYSE: [],
    companiesNASDAQ: [],
    note: "",

    isExtendingSearchMenu: false,
    isScreenSmall: false,
  };

  searchAnchorRef = createRef(null);
  prevOpenSearchMenu = false;

  timeoutForSearch; // half a second timeout -> delay searching

  setTimeoutForSearch = () => {
    this.timeoutForSearch = setTimeout(
      () => this.searchCompanyFn(),
      oneSecond / 2
    );
  };

  searchCompanyFn = () => {
    if (isEmpty(this.state.searchCompany) && this.state.openSearchMenu) {
      this.turnOffSearchMenu();
    }

    if (!isEmpty(this.state.searchCompany)) {
      if (!this.state.openSearchMenu) {
        this.turnOnSearchMenu();
      }
      this.setState({
        companiesNYSE: NYSE,
        companiesNASDAQ: NASDAQ,
        note: "",
      });
      // searchCompanyTickers(this.state.searchCompany)
      //   .then((resultTickers) => {
      //     console.log(resultTickers);
      //     this.setState({
      //       companiesNYSE: resultTickers[0],
      //       companiesNASDAQ: resultTickers[1],
      //       note:
      //         isEmpty(resultTickers[0]) && isEmpty(resultTickers[1])
      //           ? "No Stocks Found..."
      //           : "",
      //     });
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    }
  };

  changeSearchCompany = (event) => {
    if (this.timeoutForSearch) {
      clearTimeout(this.timeoutForSearch);
    }

    this.setState({
      searchCompany: event.target.value,
      companiesNASDAQ: [],
      companiesNYSE: [],
    });

    this.setTimeoutForSearch();
  };

  clearSearchCompany = () => {
    this.setState(
      {
        searchCompany: "",
      },
      () => {
        this.shrinkSearchMenu();
      }
    );
  };

  handleClose = (event) => {
    this.turnOffSearchMenu();
  };

  handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      this.turnOffSearchMenu();
    }
  };

  turnOnSearchMenu = () => {
    this.setState({
      openSearchMenu: true,
    });
  };

  turnOffSearchMenu = () => {
    this.setState({
      openSearchMenu: false,
      companiesNASDAQ: [],
      companiesNYSE: [],
    });
  };

  extendSearchMenu = (event) => {
    if (!this.state.isExtendingSearchMenu) {
      this.setState({
        isExtendingSearchMenu: true,
      });
    }
  };

  shrinkSearchMenu = (event) => {
    if (isEmpty(this.state.searchCompany)) {
      this.setState({
        isExtendingSearchMenu: false,
      });
    }
  };

  setScreenSizeState = () => {
    if (!isEqual(this.state.isScreenSmall, this.props.mediaQuery)) {
      this.setState({
        isScreenSmall: this.props.mediaQuery,
      });
    }
  };

  componentDidMount() {
    this.setScreenSizeState();
  }

  componentDidUpdate() {
    this.setScreenSizeState();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.mediaQuery, this.props.mediaQuery) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;
    const {
      openSearchMenu,
      companiesNYSE,
      companiesNASDAQ,
      note,
      isExtendingSearchMenu,
      isScreenSmall,
    } = this.state;

    return (
      <div className={classes.searchFieldMotherContainer}>
        <img
          src="/bibliko.png"
          alt="Bibliko"
          className={clsx(classes.logo, {
            [classes.hideFade]: isExtendingSearchMenu,
          })}
          onClick={() => {
            redirectToPage("/", this.props);
          }}
        />
        <IconButton
          className={clsx(classes.iconButton, {
            [classes.hideFadeIcon]: isExtendingSearchMenu,
            [classes.hideCompletely]: !isScreenSmall,
          })}
          onClick={this.extendSearchMenu}
        >
          <SearchRoundedIcon className={classes.searchIcon} />
        </IconButton>
        <div
          className={clsx(classes.searchFieldContainer, {
            [classes.extendWidthSearchField]: isExtendingSearchMenu,
            [classes.hideSearchBar]: isScreenSmall && !isExtendingSearchMenu,
          })}
        >
          <SearchField
            ref={this.searchAnchorRef}
            searchCompany={this.state.searchCompany}
            focused={this.state.isExtendingSearchMenu}
            changeSearchCompany={this.changeSearchCompany}
            clearSearchCompany={this.clearSearchCompany}
            extendSearchMenu={this.extendSearchMenu}
            shrinkSearchMenu={this.shrinkSearchMenu}
          />
          <SearchPopper
            openSearchMenu={openSearchMenu}
            searchAnchorRef={this.searchAnchorRef}
            handleClose={this.handleClose}
            handleListKeyDown={this.handleListKeyDown}
            note={note}
            companiesNYSE={companiesNYSE}
            companiesNASDAQ={companiesNASDAQ}
            showLinearProgressBar={this.showLinearProgressBar}
          />
        </div>
      </div>
    );
  }
}

export default ComponentWithForwardedRef(
  withStyles(styles)(
    withTheme(
      withRouter(withMediaQuery("(max-width:599px)")(SearchFieldLayout))
    )
  )
);
