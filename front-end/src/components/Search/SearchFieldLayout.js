import React from "react";
import clsx from "clsx";
import { isEmpty, isEqual, pick } from "lodash";
import { withRouter } from "react-router";

import { withMediaQuery } from "../../theme/ThemeUtil";
import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";
import { searchCompanyTickers } from "../../utils/FinancialModelingPrepUtil";
import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";

import SearchPopper from "./SearchPopper";
import SearchField from "./SearchField";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { IconButton, ClickAwayListener } from "@material-ui/core";

import { SearchRounded as SearchRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  searchFieldMotherContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: theme.customWidth.maxSearchFieldWithLogo,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
    paddingLeft: theme.customMargin.appBarPadding,
  },
  searchFieldContainer: {
    width: theme.customWidth.maxSearchFieldWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
    opacity: 1,
    transition: "width 0.3s, opacity 0.25s ease-in 0.1s",
    zIndex: theme.customZIndex.searchFieldContainer,
  },
  extendWidthSearchField: {
    width: "100%",
  },
  searchIcon: {
    color: theme.palette.searchFieldBackground.searchIcon,
    width: "80%",
    height: "80%",
  },
  iconButton: {
    left: "95px",
    [theme.breakpoints.down("xs")]: {
      left: "90px",
    },
    backgroundColor: theme.palette.searchFieldBackground.main,
    "&:hover": {
      backgroundColor: theme.palette.searchFieldBackground.onHover,
    },
    "& .MuiTouchRipple-root span": {
      backgroundColor: theme.palette.searchFieldBackground.rippleSpan,
    },
    padding: 0,
    position: "absolute",
    height: "25px",
    width: "25px",
    borderRadius: "50%",
    opacity: 1,
    transition: "left 0.2s ease-in-out, opacity 0.25s ease-in",
  },
  logo: {
    left: theme.customMargin.appBarPadding,
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
    width: "50%",
    opacity: 0,
    padding: 0,
    position: "absolute",
    left: "-100%",
  },
  hideCompletely: {
    display: "none",
  },
});

class SearchFieldLayout extends React.Component {
  state = {
    openSearchMenu: false,
    searchCompany: "",
    companiesNYSE: [],
    companiesNASDAQ: [],
    note: "",
    focusItem: false,
    isScreenSmall: false,
  };

  prevOpenSearchMenu = false;

  timeoutForSearch; // 1/3 second timeout -> delay searching
  timeoutForClosing; // delay closing on empty

  setTimeoutForSearch = () => {
    this.timeoutForSearch = setTimeout(
      () => this.searchCompanyFn(),
      oneSecond / 3
    );
  };

  setTimeoutForClosing = (duration = oneSecond) => {
    this.timeoutForClosing = setTimeout(
      () => this.turnOffSearchMenu(),
      duration
    );
  };

  searchCompanyFn = () => {
    if (isEmpty(this.state.searchCompany) && this.state.openSearchMenu) {
      this.setTimeoutForClosing();
    }

    if (!isEmpty(this.state.searchCompany)) {
      if (!this.state.openSearchMenu) {
        this.turnOnSearchMenu();
      }
      searchCompanyTickers(this.state.searchCompany)
        .then((resultTickers) => {
          this.setState({
            companiesNYSE: resultTickers[0] || [],
            companiesNASDAQ: resultTickers[1] || [],
            note:
              isEmpty(resultTickers[0]) && isEmpty(resultTickers[1])
                ? "No Stocks Found..."
                : "",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  changeSearchCompany = (event) => {
    if (this.timeoutForSearch) {
      clearTimeout(this.timeoutForSearch);
    }
    if (this.timeoutForClosing) {
      clearTimeout(this.timeoutForClosing);
    }

    this.setState(
      {
        searchCompany: event.target.value,
        companiesNASDAQ: [],
        companiesNYSE: [],
        focusItem: false,
      },
      () => this.setTimeoutForSearch()
    );
  };

  clearSearchCompany = () => {
    this.setState(
      { searchCompany: "" },
      () => this.setTimeoutForClosing(oneSecond * 1.5)
    );
  };

  handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      this.turnOffSearchMenu();
    }
  };

  handleSearchFieldKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.setState({ focusItem: true });
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
      searchCompany: "",
      companiesNASDAQ: [],
      companiesNYSE: [],
      note: "",
      focusItem: false,
    });
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
    const compareKeys = ["classes", "mediaQuery"];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);
    return (
      !isEqual(nextPropsCompare, propsCompare) ||
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
      isScreenSmall,
      searchCompany,
      focusItem,
    } = this.state;

    return (
      <div className={classes.searchFieldMotherContainer}>
        <img
          src="/bibliko.png"
          alt="Bibliko"
          className={clsx(classes.logo, {
            [classes.hideFade]: openSearchMenu,
          })}
          onClick={() => {
            redirectToPage("/", this.props);
          }}
        />

        <IconButton
          className={clsx(classes.iconButton, {
            [classes.hideFadeIcon]: openSearchMenu,
            [classes.hideCompletely]: !isScreenSmall,
          })}
          onClick={this.turnOnSearchMenu}
        >
          <SearchRoundedIcon className={classes.searchIcon} />
        </IconButton>

        <ClickAwayListener
          onClickAway={!isScreenSmall ? this.turnOffSearchMenu : () => {}}
        >
          <div
            className={clsx(classes.searchFieldContainer, {
              [classes.extendWidthSearchField]: openSearchMenu,
              [classes.hideSearchBar]: isScreenSmall && !openSearchMenu,
            })}
          >
            <SearchField
              searchCompany={searchCompany}
              focused={openSearchMenu}
              changeSearchCompany={this.changeSearchCompany}
              clearSearchCompany={this.clearSearchCompany}
              turnOnSearchMenu={this.turnOnSearchMenu}
              handleKeyDown={this.handleSearchFieldKeyDown}
            />
            <SearchPopper
              openSearchMenu={openSearchMenu}
              handleClose={this.turnOffSearchMenu}
              handleListKeyDown={this.handleListKeyDown}
              note={note}
              companiesNYSE={companiesNYSE}
              companiesNASDAQ={companiesNASDAQ}
              searchCompanyKey={searchCompany}
              focusItem={focusItem}
            />
          </div>
        </ClickAwayListener>
      </div>
    );
  }
}

export default withStyles(styles)(
  withTheme(withRouter(withMediaQuery("(max-width:599px)")(SearchFieldLayout)))
);
