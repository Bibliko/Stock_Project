import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";

import { VariableSizeList } from "react-window";

import { withStyles, useTheme } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  TextField,
  useMediaQuery,
  ListSubheader,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import themeObj from "../../theme/themeObj";

const styles = (theme) => ({
  paper: {
    backgroundColor: "black",
  },
  listbox: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
  option: {
    "&:hover, &[aria-selected=\"true\"], &[data-focus=\"true\"]": {
      backgroundColor: themeObj.palette.menuItemHover.main,
    },
  },
  noOptions: {
    color: "white",
    backgroundColor: themeObj.palette.menuItemHover.main,
  },
  selectBoxContainer: {
    maxWidth: "none",
    marginLeft: "10px",
    marginRight: "10px",
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  selectBox: {
    width: "100%",
    marginTop: "5px",
  },
  input: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.paperBackground.onPageSuperLight,
    "&:hover": {
      backgroundColor: theme.palette.paperBackground.onPageLight,
    },
    "& input": {
      backgroundColor: "transparent",
    },
    fontSize: "medium",
    height: theme.customHeight.settingTextField,
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
      height: theme.customHeight.settingTextFieldSmall,
    },
    "& .MuiOutlinedInput-input": {
      paddingTop: "10px",
      paddingBottom: "10px",
      [theme.breakpoints.down("xs")]: {
        paddingTop: "6px",
        paddingBottom: "6px",
      },
    },
    "&.Mui-disabled": {
      color: theme.palette.disabled.whiteColor,
    },
  },
  title: {
    color: "white",
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    paddingLeft: "5px",
    fontWeight: "bold",
  },
});

const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
          style={{
            backgroundColor: themeObj.palette.paperBackground.onPage,
            color: "white",
          }}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

class VirtualizedAutocomplete extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.classes, this.props.classes) ||
      !isEqual(nextProps.autocompleteKey, this.props.autocompleteKey) ||
      !isEqual(nextProps.options, this.props.options)
    );
  }

  render() {
    const {
      classes,
      containerClass,
      autocompleteKey,
      name,
      disabled,
      loading,
      value,
      onChange,
      options,
    } = this.props;

    return (
      <Container className={clsx(classes.selectBoxContainer, containerClass)}>
        <Typography className={classes.title} >{name}</Typography>
        <Autocomplete
          id="stock-selector"
          key={autocompleteKey}
          value={value}
          onChange={onChange}
          disabled={disabled}
          loading={loading}
          className={classes.selectBox}
          disableListWrap
          autoSelect
          classes={{
            paper: classes.paper,
            listbox: classes.listbox,
            option: classes.option,
            loading: classes.noOptions,
            noOptions: classes.noOptions,
            input: classes.input,
          }}
          ListboxComponent={ListboxComponent}
          options={options}
          renderInput={(params) => (
            <div ref={disabled ? null : params.InputProps.ref}>
              <TextField
                variant="outlined"
                InputProps={{ className: classes.input }}
                {...params.inputProps}
              />
            </div>
          )}
          renderOption={(option) => <Typography noWrap>{option}</Typography>}
        />
      </Container>
    );
  }
}

export default withStyles(styles)(VirtualizedAutocomplete);
