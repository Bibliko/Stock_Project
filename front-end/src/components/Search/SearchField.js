import React from "react";
import { isEmpty } from "lodash";
import clsx from "clsx";
import { ComponentWithForwardedRef } from "../../utils/low-dependency/ComponentUtil";

import { withStyles } from "@material-ui/core/styles";
import { TextField, InputAdornment, IconButton } from "@material-ui/core";

import {
  ClearRounded as ClearRoundedIcon,
  SearchRounded as SearchRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  textField: {
    width: "100%",
    margin: "8px",
    [theme.breakpoints.down("xs")]: {
      position: "absolute",
      width: "75%",
      left: "calc((100% - 48px - 75%) / 2)", // 48px is default width and height of icon button
    },
    fontWeight: "normal",
    color: "white",
    backgroundColor: theme.palette.searchFieldBackground.main,
    "&:hover": {
      backgroundColor: theme.palette.searchFieldBackground.onHover,
    },
    borderRadius: "20px",
    zIndex: theme.customZIndex.searchFieldTextField,
    "& .MuiInputBase-root": {
      height: "40px",
      [theme.breakpoints.down("xs")]: {
        height: "30px",
      },
      borderRadius: theme.customMargin.appBarPadding,
    },
    "& .MuiInputLabel-outlined": {
      transform: "translate(14px, 13px) scale(1)",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(19px, -4px) scale(0.75)",
    },
    "& .MuiOutlinedInput-underline:after": {
      borderBottom: "2px solid #000000",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: 0,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderWidth: 0,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 0,
    },
  },
  backgroundWhenTextFieldOpen: {
    marginLeft: "-4px",
  },
  input: {
    color: "white",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
  },
  iconButton: {
    padding: "8px",
  },
  clearIcon: {
    color: "rgba(255, 255, 255, 0.8)",
    [theme.breakpoints.down("xs")]: {
      height: "20px",
      width: "20px",
    },
  },
  searchIcon: {
    color: "rgba(255, 255, 255, 0.6)",
    [theme.breakpoints.down("xs")]: {
      height: "20px",
      width: "20px",
    },
  },
  hide: {
    display: "none",
  },
});

class SearchField extends React.Component {
  inputRef = React.createRef(null);

  focusInput = () => {
    if (this.props.focused) {
      this.inputRef.current.focus();
    } else {
      this.inputRef.current.blur();
    }
  };

  componentDidMount() {
    this.focusInput();
  }

  componentDidUpdate() {
    this.focusInput();
  }

  render() {
    const {
      classes,
      forwardedRef,
      searchCompany,
      changeSearchCompany,
      turnOnSearchMenu,
      clearSearchCompany,
      focused,
    } = this.props;

    return (
      <TextField
        id="Search"
        ref={forwardedRef}
        value={searchCompany}
        placeholder="Search..."
        inputRef={this.inputRef}
        autoComplete="off"
        variant="outlined"
        margin="normal"
        className={clsx(classes.textField, {
          [classes.backgroundWhenTextFieldOpen]: focused,
        })}
        onChange={changeSearchCompany}
        onClick={turnOnSearchMenu}
        InputProps={{
          classes: {
            input: classes.input,
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                className={clsx(classes.iconButton, {
                  [classes.hide]: isEmpty(searchCompany),
                })}
                onClick={clearSearchCompany}
                disableRipple
              >
                <ClearRoundedIcon className={classes.clearIcon} />
              </IconButton>
              <IconButton edge="end" className={classes.iconButton} disabled>
                <SearchRoundedIcon
                  edge="end"
                  className={clsx(classes.searchIcon, {
                    [classes.hide]: !isEmpty(searchCompany),
                  })}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }
}

export default ComponentWithForwardedRef(withStyles(styles)(SearchField));
