import React from "react";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";

import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";
import { redirectToPage } from "../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  Popper,
  Fade,
  Paper,
  MenuList,
  MenuItem,
  LinearProgress,
  Typography,
  Grid,
  IconButton,
} from "@material-ui/core";

import { ArrowBackRounded as ArrowBackRoundedIcon } from "@material-ui/icons";

const styles = (theme) => ({
  popperSearch: {
    position: "fixed",
    [theme.breakpoints.down("xs")]: {
      width: "100vw",
    },
    width: "425px",
    maxHeight: "50%",
    zIndex: theme.customZIndex.searchMenu,
  },
  menuPaper: {
    background: theme.palette.paperBackground.onPage,
    boxShadow: theme.customShadow.popup,
    color: "white",
    paddingTop: theme.customHeight.appBarHeight,
    [theme.breakpoints.down("xs")]: {
      paddingTop: theme.customHeight.appBarHeightSmall,
    },
  },
  searchNote: {
    fontSize: "small",
    padding: "16px",
  },
  searchItem: {
    fontSize: "small",
  },
  menuItemHover: {
    "&:hover, &:focus": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
  },
  backButton: {
    position: "absolute",
    top: "5px",
    right: "10px",
    [theme.breakpoints.down("xs")]: {
      right: "8px",
      padding: "8px",
    },
    color: "white",
    "&:hover, &:focus": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
  },
});

class SearchPopper extends React.Component {
  getRectangle = () => {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    };
  };

  fakeReference = {
    getBoundingClientRect: this.getRectangle,
    clientWidth: this.getRectangle().width,
    clientHeight: this.getRectangle().height,
  };

  showResultTickers = (company, classes) => {
    const { symbol, name } = company;
    return (
      <Grid container>
        <Grid item xs={3}>
          <Typography className={classes.searchItem}>{symbol}</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography className={classes.searchItem} noWrap>
            {name}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  showLinearProgressBar = () => {
    const {
      companiesNASDAQ,
      companiesNYSE,
      note,
      searchCompanyKey,
    } = this.props;
    if (
      isEmpty(companiesNASDAQ) &&
      isEmpty(companiesNYSE) &&
      isEmpty(note) &&
      !isEmpty(searchCompanyKey)
    ) {
      return true;
    } else {
      return false;
    }
  };

  handleClickResult = (companyCode) => {
    redirectToPage(`/company/${companyCode}`, this.props);
    this.props.handleClose();
  };

  render() {
    const {
      classes,
      openSearchMenu,
      handleClose,
      handleListKeyDown,
      note,
      companiesNYSE,
      companiesNASDAQ,
      focusItem,
    } = this.props;

    return (
      <Popper
        open={openSearchMenu}
        placement="bottom-start"
        anchorEl={this.fakeReference}
        className={classes.popperSearch}
        transition
        disablePortal={true}
        modifiers={{
          flip: {
            enabled: true,
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: "viewport",
          },
        }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            timeout={{ enter: 0.2 * oneSecond, exit: 0.5 * oneSecond }}
            {...TransitionProps}
          >
            <Paper className={classes.menuPaper}>
              <IconButton onClick={handleClose} className={classes.backButton}>
                <ArrowBackRoundedIcon />
              </IconButton>
              <MenuList
                id="menu-list-grow"
                onKeyDown={handleListKeyDown}
                autoFocusItem={focusItem}
              >
                <MenuItem dense disabled>
                  Stocks
                </MenuItem>

                {this.showLinearProgressBar() && <LinearProgress />}
                {!isEmpty(note) && (
                  <Typography className={classes.searchNote}>{note}</Typography>
                )}

                {companiesNYSE.map((company, index) => (
                  <MenuItem
                    dense
                    key={`NYSE-${index}`}
                    className={classes.menuItemHover}
                    onClick={() => this.handleClickResult(company.symbol)}
                  >
                    {this.showResultTickers(company, classes)}
                  </MenuItem>
                ))}

                {companiesNASDAQ.map((company, index) => (
                  <MenuItem
                    dense
                    key={`NASDAQ-${index}`}
                    className={classes.menuItemHover}
                    onClick={() => this.handleClickResult(company.symbol)}
                  >
                    {this.showResultTickers(company, classes)}
                  </MenuItem>
                ))}
              </MenuList>
            </Paper>
          </Fade>
        )}
      </Popper>
    );
  }
}

export default withStyles(styles)(withRouter(SearchPopper));
