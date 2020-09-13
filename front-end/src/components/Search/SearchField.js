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
    fontWeight: "normal",
    color: "white",
    "& .MuiInputBase-root": {
      height: "40px",
      borderRadius: "20px",
      boxShadow: `0.5px 0.5px 1px ${theme.palette.searchField.main}`,
      "&:hover": {
        boxShadow: `0.5px 0.5px 1px ${theme.palette.searchField.onHover}`,
      },
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
      borderWidth: "2px",
      borderColor: theme.palette.searchField.main,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.searchField.onHover,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.searchField.onHover,
    },
    "& .MuiFormLabel-root": {
      fontSize: "small",
      color: theme.palette.searchField.main,
      "&.Mui-focused": {
        color: theme.palette.searchField.onHover,
      },
    },
  },
  input: { color: "white", fontSize: "medium" },
  iconButton: { color: "rgba(255, 255, 255, 0.8)" },
  searchIcon: { color: theme.palette.searchField.main },
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
      extendSearchMenu,
      shrinkSearchMenu,
      clearSearchCompany,
    } = this.props;

    return (
      <TextField
        id="Search"
        ref={forwardedRef}
        value={searchCompany}
        label="Search"
        inputRef={this.inputRef}
        autoComplete="off"
        variant="outlined"
        margin="normal"
        className={classes.textField}
        onChange={changeSearchCompany}
        onClick={extendSearchMenu}
        onBlur={shrinkSearchMenu}
        InputProps={{
          className: classes.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                className={clsx(classes.iconButton, {
                  [classes.hide]: isEmpty(searchCompany),
                })}
                onClick={clearSearchCompany}
              >
                <ClearRoundedIcon />
              </IconButton>
              <SearchRoundedIcon
                className={clsx(classes.searchIcon, {
                  [classes.hide]: !isEmpty(searchCompany),
                })}
              />
            </InputAdornment>
          ),
        }}
      />
    );
  }
}

export default ComponentWithForwardedRef(withStyles(styles)(SearchField));
