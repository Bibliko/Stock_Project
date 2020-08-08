import React from "react";
import { isEmpty } from "lodash";
import clsx from "clsx";
import { ComponentWithForwardedRef } from "../../utils/ComponentUtil";

import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";

import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

const styles = (theme) => ({
  textField: {
    width: "100%",
    margin: "8px",
    fontWeight: "normal",
    color: "white",
    "& .MuiInputBase-root": {
      height: "40px",
      borderRadius: "20px",
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
      borderColor: "rgba(156, 140, 249, 0.8)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 1)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(156, 140, 249, 1)",
    },
    "& .MuiFormLabel-root": {
      fontSize: "small",
      color: "rgba(156, 140, 249, 0.7)",
      "&.Mui-focused": {
        color: "rgba(156, 140, 249, 1)",
      },
    },
  },
  input: { color: "white", fontSize: "medium" },
  iconButton: { color: "rgba(255, 255, 255, 0.8)" },
  searchIcon: { color: "rgba(156, 140, 249, 0.7)" },
  hide: {
    display: "none",
  },
});

class SearchField extends React.Component {
  render() {
    const {
      classes,
      forwardedRef,
      searchCompany,
      focused,
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
        focused={focused}
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
