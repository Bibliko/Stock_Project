import React from "react";

import { withStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  FormControl,
  Select,
  InputBase,
} from "@material-ui/core";

import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

const styles = (theme) => ({
  menuList: {
    backgroundColor: theme.palette.paperBackground.onPage,
    color: "white",
  },
  menuItem: {
    "&:hover": {
      backgroundColor: theme.palette.menuItemHover.main,
    },
    "&.MuiListItem-root": {
      "&.Mui-selected": {
        backgroundColor: theme.palette.menuItemHover.main,
      },
    },
  },
  hide: {
    display: "none",
  },
});

const StyledInput = withStyles(() => ({
  input: {
    position: "relative",
    backgroundColor: "transparent",
    border: "none",
    "&:focus": {
      background: "transparent",
    }
  }
}))(InputBase);

const StyledSelect = withStyles(() => ({
  root: {
    // placeholder for fontStyle from props
  },
  icon: {
    color: "white",
    position: "absolute",
  },
  selectMenu: {
    minHeight: "auto",
  },
  select: {
    "&.MuiSelect-select": {
      padding: "10px 35px 10px 12px",
    }
  }
}))(Select);

class SelectNoBox extends React.Component {
  state = { open: false }

  openMenu = () => {
    this.setState({ open: true });
  };

  closeMenu = () => {
    this.setState({ open: false });
  };

  render() {
    const { open } = this.state;
    const {
      classes,
      containerStyle,
      fontStyle,
      items,
      value,
      onChange,
    } = this.props;

    return (
      <div className={containerStyle}>
        <FormControl>
          <StyledSelect
            open={open}
            value={value}
            onOpen={this.openMenu}
            onClose={this.closeMenu}
            onChange={onChange}
            classes={{root: fontStyle}}
            input={<StyledInput />}
            MenuProps={{ classes: { paper: classes.menuList } }}
            IconComponent={(props) => <SettingsRoundedIcon {...props} />}
          >
            { value ||
              <MenuItem className={classes.hide} aria-label="None" value="">
                {" "}
              </MenuItem>
            }
            { items.map((item) => (
                <MenuItem key={item.value} value={item.value} className={classes.menuItem}>
                  {item.label}
                </MenuItem>
              ))
            }
          </StyledSelect>
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(SelectNoBox);