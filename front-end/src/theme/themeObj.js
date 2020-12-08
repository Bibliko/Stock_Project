/* 
  palette:
  - Basic
  - App Bar
  - Paper
  - Login
  - Menu
  - Text
  - Snack Bar
  - Speed Dial
  - Search Field
  - Donut Chart
  - Switch dark / light mode
*/

const theme = {
  customShadow: {
    popup:
      "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
    popupLight:
      "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(255,255,255,0.14), 0px 1px 18px 0px rgba(255,255,255,0.12)",
    tableContainer:
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  customWidth: {
    maxSearchFieldWithLogo: "370px",
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
    appBarPadding: "20px",

    topLayout: "80px",
    topLayoutSmall: "70px",

    topFloatingToolButton: "110px",
    smallTopFloatingToolButton: "100px",

    dialogItemsTransactionsHistoryFilters: "20px",

    companyDetailPageSectionMarginBottom: "10px",
  },
  customZIndex: {
    reminder: 10,
    floatingToolButton: 5,
    floatingActionButton: 5,
    appBar: 1100, // This is already embedded in .MuiAppBar-root
    searchFieldContainer: 1000,
    searchMenu: 1200,
    searchFieldTextField: 1300,
  },

  typography: {
    fontFamily: `"Open Sans", sans-serif`,
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
  },

  palette: {
    // Basic
    primary: {
      // Purple
      main: "rgba(136, 120, 255, 1)",
      hover: "rgba(136, 120, 255, 0.3)",

      subLight: "rgba(120, 127, 246, 1)",

      subDark: "rgba(104, 80, 230, 1)",
      subDarkHover: "rgba(126, 101, 255, 1)",
    },

    secondary: {
      // Light Blue + Green
      main: "rgba(128, 222, 255, 1)",
      hover: "rgba(128, 222, 255, 0.3)",
    },

    gradient: {
      main:
        "linear-gradient(90deg, rgba(138, 118, 255, 1), rgba(97, 213, 255, 1))", // Used for titles
    },

    succeed: {
      main: "rgba(30, 198, 36, 1)", // Green
      sub: "rgba(60, 140, 165, 1)", // Light Blue + Green
      subHover: "rgba(70, 160, 185, 1)",
    },

    fail: {
      // Red
      main: "rgba(200, 50, 50, 1)",
      mainHover: "rgba(230, 60, 60, 1)",
      sub: "rgba(255, 105, 105, 1)",
    },

    disabled: {
      // Grey
      main: "rgba(255, 255, 255, 0.3)",
    },

    // App Bar
    appBarBackground: {
      // Dark Blue
      main: "rgba(43, 12, 154, 0.95)",
    },

    // Paper
    paperBackground: {
      main: "rgba(0, 0, 0, 1)", // Black
      sub: "rgba(107, 87, 224, 1)", // Dark Purple

      // Grey
      onPage: "rgba(30, 33, 36, 1)",
      onPageLight: "rgba(40, 43, 46, 1)",
      onPageSuperLight: "rgba(60, 63, 66, 1)",
      hoverBlur: "rgba(255, 255, 255, 0.25)",
    },

    // Login
    loginBackground: {
      main: "#0d0d0d",
    },

    gradientPaper: {
      main: "rgba(90, 105, 201, 1)",
    },

    submitButton: {
      main: "#222f80",
    },

    // Menu
    menuItemHover: {
      main: "rgba(255, 255, 255, 0.2)",
    },

    // Text
    loginLink: {
      main: "#e0e0e0",
    },

    normalFontColor: {
      primary: "white",
      secondary: "rgba(169, 179, 187, 1)",
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
    searchFieldBackground: {
      main: "rgba(60, 60, 60, 1)",
      onHover: "rgba(70, 70, 70, 1)",
      rippleSpan: "rgba(100, 100, 100, 0.9)",
      searchIcon: "rgba(255, 255, 255, 0.7)",
    },

    // Donut Chart
    donutChart: {
      cash: "#3c71d0",
      shares: "#D4AF37",
      text: "white",
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
        backgroundColor: "rgba(59, 64, 68, 1)", // theme.palette.paperBackground.onPageLight
        color: "white",
      },
    },
  },
};

export default theme;
