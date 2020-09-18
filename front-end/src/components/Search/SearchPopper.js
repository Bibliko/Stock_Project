import React from "react";
import { isEmpty } from "lodash";

import { oneSecond } from "../../utils/low-dependency/DayTimeUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  Popper,
  Fade,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  LinearProgress,
  Typography,
  Grid,
} from "@material-ui/core";

const styles = (theme) => ({
  popperSearch: {
    minWidth: "450px",
    [theme.breakpoints.down("xs")]: {
      minWidth: 0,
      width: "100vw",
    },
    width: "40%",
    maxWidth: "100%",
    maxHeight: "50%",
    zIndex: theme.customZIndex.searchMenu,
  },
  menuPaper: {
    backgroundColor: theme.palette.menuBackground.main,
    color: "white",
  },
  searchNote: { fontSize: "small", padding: "16px" },
  searchItem: { fontSize: "small" },
});

class SearchPopper extends React.Component {
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
    const { companiesNASDAQ, companiesNYSE, note } = this.props;
    if (isEmpty(companiesNASDAQ) && isEmpty(companiesNYSE) && isEmpty(note)) {
      return true;
    } else {
      return false;
    }
  };

  render() {
    const {
      classes,
      openSearchMenu,
      searchAnchorRef,
      handleClose,
      handleListKeyDown,
      note,
      companiesNYSE,
      companiesNASDAQ,
    } = this.props;

    return (
      <Popper
        open={openSearchMenu}
        anchorEl={searchAnchorRef.current}
        placement="bottom-start"
        className={classes.popperSearch}
        transition
        modifiers={{
          flip: {
            enabled: false,
          },
        }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            timeout={{ enter: (2 / 10) * oneSecond, exit: (1 / 2) * oneSecond }}
            {...TransitionProps}
          >
            <Paper className={classes.menuPaper}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  <MenuItem dense disabled>
                    Stocks
                  </MenuItem>
                  {this.showLinearProgressBar() && <LinearProgress />}
                  {!isEmpty(note) && (
                    <Typography className={classes.searchNote}>
                      {note}
                    </Typography>
                  )}
                  {companiesNYSE.map((company, index) => (
                    <MenuItem dense key={index}>
                      {this.showResultTickers(company, classes)}
                    </MenuItem>
                  ))}
                  {companiesNASDAQ.map((company, index) => (
                    <MenuItem dense key={index}>
                      {this.showResultTickers(company, classes)}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    );
  }
}

export default withStyles(styles)(SearchPopper);
