/* 
  palette:
  - Basic
  - App Bar
  - Paper
  - Table
  - Menu
  - Text
  - Filter
  - Snack Bar
  - Speed Dial
  - Search Field
  - Switch dark / light mode
*/

const theme = {
  customWidth: {
    maxSearchFieldWithLogo: "360px",
    maxSearchFieldWidth: "240px",

    mainPageWidth: "90%",
    mainSkeletonWidth: "100%",

    redirectingPaper: "90%",
  },
  customHeight: {
    appBarHeight: "60px",
    appBarHeightSmall: "50px",

    redirectingPaper: "200px",

    settingTextField: "45px",
    settingTextFieldSmall: "35px",
  },
  customMargin: {
    topLayout: "80px",
    topLayoutSmall: "70px",

    topFloatingToolButton: "110px",
    smallTopFloatingToolButton: "100px",

    dialogItemsTransactionsHistoryFilters: "20px",
  },
  customZIndex: {
    reminder: 10,
    floatingToolButton: 5,
    floatingActionButton: 5,
    appBar: 1100, // This is already embedded in .MuiAppBar-root
    searchFieldContainer: 1000,
    searchMenu: 1200,
  },
  palette: {
    // Basic
    primary: {
      main: "#2196f3",
    },

    succeed: {
      main: "rgba(32, 154, 85, 1)",
      tableSorted: "rgba(90, 210, 130, 1)",
      tableSortIcon: "rgba(90, 210, 130, 0.8)",
    },

    fail: {
      main: "#DC3D4A",
      backgroundColor: "rgba(220, 61, 74, 0.2)",
      backgroundColorHover: "rgba(220, 61, 74, 0.3)",
    },

    disabled: {
      whiteColor: "rgba(255, 255, 255, 0.3)",
    },

    // App Bar
    appBarButtonBackground: {
      gradient: "linear-gradient(#66CCFF 20%, #6666FF 50%)",
    },

    appBarBlue: {
      main: "rgba(35, 20, 150, 1)",
    },

    // Paper
    paperBackground: {
      main: "#1E1E1E",
      onPage: "rgba(46, 44, 48, 1)",
      deepBlueTable: "rgba(26,22,75,1)",
      gradient: "linear-gradient(180deg, #1E1E1E 30%, #180B66 100%)",
    },

    gradientPaper: {
      main:
        "linear-gradient(180deg, #300B66 0%, rgba(255,255,255,0) 70%),linear-gradient(180deg, #FF3747 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, #FFFFFF 50%, rgba(255,255,255,0) 100%), #9ED2EF",
    },

    // Table
    tableBackground: {
      gradient: "linear-gradient(180deg, #1b163d 0%, #180f56 100%)",
    },

    tableHeader: {
      darkBlue: "rgba(35, 20, 150, 1)",
      lightBlue: "rgba(0, 185, 209, 1)",
      purple: "rgba(93, 64, 219, 1)",
    },

    tableRow: {
      lightBlue: "rgba(54, 151, 254, 1)",
      darkBlue: "rgba(19, 100, 186, 1)",
    },

    // Menu
    menuBackground: {
      main: "#303030",
    },

    // Text
    subText: {
      main: "rgba(5, 5, 5, 1)",
    },
    bigTitle: {
      purple: "rgba(110, 80, 240, 1)",
      lightBlue: "rgba(54, 151, 254, 1)",
      lighterBlue: "rgba(116, 224, 239, 1)",
      blue: "rgba(47, 128, 237, 1)",
      red: "rgba(220, 61, 74, 1)",
    },

    // Filter
    filterButton: {
      main: "rgba(74, 50, 209, 1)",
      onHover: "rgba(90, 70, 220, 1)",
    },

    // Snack Bar
    refreshSnackbar: {
      main: "rgba(80, 60, 210, 1)",
      reloadButton: "rgba(40, 180, 260, 1)",
    },

    // Speed Dial (<=> Back Drop)
    layoutSpeedDial: {
      main: "rgba(74, 50, 209, 1)",
      onHover: "rgba(90, 70, 220, 1)",
    },

    // Search Field
    searchField: {
      main: "rgba(160, 150, 250, 0.7)",
      onHover: "rgba(160, 150, 250, 1)",
    },

    searchFieldButtonSmallScreen: {
      main: "rgba(160, 150, 250, 0.3)",
      onHover: "rgba(160, 150, 250, 0.4)",
      rippleSpan: "rgba(160, 150, 250, 0.6)",
      searchIcon: "rgba(160, 150, 250, 1)",
    },

    // Switch dark / light mode
    type: "light",
  },

  overrides: {
    // Mui Pickers
    MuiPickersToolbar: {
      root: {
        backgroundColor: "#000033",
        color: "#3399FF",
      },
      dateTitleContainer: {
        color: "white",
      },
    },

    MuiPickersCalendarHeader: {
      root: {
        backgroundColor: "#3399FF",
        marginTop: "0px",
        marginBottom: "0px",
        minHeight: "50px",
        maxHeight: "50px",
        color: "white",
      },
      monthTitleContainer: {
        color: "black",
      },
    },
    MuiPickersCalendar: {
      daysHeader: {
        backgroundColor: "#000066",
        "& span": {
          color: "white",
        },
      },
      root: {
        backgroundColor: "#000066",
      },
    },
    MuiPickersArrowSwitcher: {
      iconButton: {
        backgroundColor: "unset",
      },
    },

    MuiPickersYear: {
      yearButton: {
        "&:hover": {
          backgroundColor: "#3399FF",
        },
        "&$selected": {
          backgroundColor: "#3399FF",
        },
        "&$disabled": {
          color: "rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.02)",
        },
      },
    },
    MuiPickersMonth: {
      root: {
        "&:hover": {
          backgroundColor: "rgba(51, 153, 255, 0.4)",
          color: "white",
        },
        "&.Mui-selected": {
          color: "#3399FF",
        },
      },
    },
    MuiPickersDay: {
      root: {
        color: "white",
        border: "unset",
        backgroundColor: "rgba(255,255,255,0.2)",
        transition: "unset",
        "&:hover": {
          backgroundColor: "rgba(51, 153, 255, 0.7)",
          "&.Mui-selected": {
            backgroundColor: "rgba(51, 153, 255, 0.7)",
          },
        },
        "&:focus": {
          backgroundColor: "rgba(51, 153, 255, 0.9)",
          "&.Mui-selected": {
            backgroundColor: "rgba(51, 153, 255, 0.9)",
          },
        },
        "&$selected": {
          backgroundColor: "#3399FF",
        },
        "&$disabled": {
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.5)",
        },
      },
      today: {
        border: "unset",
        "&:not(.Mui-selected)": {
          border: "unset",
        },
      },
    },
    MuiPickersYearSelection: {
      root: {
        backgroundColor: "#000066",
        margin: "none",
        color: "white",
      },
    },
    MuiPickersMonthSelection: {
      root: {
        backgroundColor: "#000066",
        margin: "none",
        color: "white",
        width: "unset",
      },
    },

    MuiFormHelperText: {
      root: {
        color: "#3399FF",
      },
    },

    MuiPickersBasePicker: {
      pickerViewLandscape: {
        padding: "none",
        backgroundColor: "#303030",
      },
      pickerView: {
        backgroundColor: "#303030",
      },
    },
    MuiPickersModalDialog: {
      dialogAction: {
        backgroundColor: "#000033",
        "& button": {
          color: "#3399FF",
          "&:hover": {
            backgroundColor: "rgba(51, 153, 255, 0.2)",
          },
        },
      },
    },

    MuiPickersCalendarView: {
      viewTransitionContainer: {
        backgroundColor: "#000066",
      },
    },
    MuiPickersMobileKeyboardInputView: {
      root: {
        backgroundColor: "#000066",
      },
    },

    // Mui Popover
    MuiPopover: {
      paper: {
        backgroundColor: "rgba(46, 44, 48, 1)",
        color: "white",
      },
    },
  },
};

export default theme;
