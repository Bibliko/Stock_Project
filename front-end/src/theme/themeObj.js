/* 
  palette:
  - Basic
  - App Bar
  - Paper
  - Login
  - Table
  - Menu
  - Text
  - Snack Bar
  - Speed Dial
  - Search Field
  - Company Detailed Page
  - Switch dark / light mode
*/

const theme = {
  customShadow: {
    popup:
      "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
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
  palette: {
    // Basic
    primary: {
      main: "rgba(135, 143, 255, 1)",
      hover: "rgba(135, 143, 255, 0.3)",
      sub: "rgba(104, 80, 230, 1)",
      subHover: "rgba(126, 101, 255, 1)",
    },

    secondary: {
      main: "rgba(128, 222, 255, 1)",
      hover: "rgba(128, 222, 255, 0.3)",
      sub: "rgba(120, 127, 246, 1)",
    },

    succeed: {
      main: "rgba(30, 198, 36, 1)",
      sub: "rgba(47, 134, 165, 1)",
      subHover: "rgba(53, 150, 185, 1)",
    },

    fail: {
      main: "rgba(200, 50, 50, 1)",
      mainHover: "rgba(230, 60, 60, 1)",
      sub: "rgba(255, 105, 105, 1)",
    },

    disabled: {
      main: "rgba(255, 255, 255, 0.3)",
    },

    // App Bar
    appBarBackground: {
      main: "rgba(43, 12, 154, 0.95)",
    },

    // Paper
    paperBackground: {
      main: "rgba(22, 26, 27, 1)",
      sub: "rgba(54, 36, 157, 1)", // The same color as theme.palette.appBarBackground.main with full opacity
      onPage: "rgba(47, 51, 54, 1)",
      onPageLight: "rgba(59, 64, 68, 1)",
      // secondLayer: "#141466",
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

    // Table
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
    menuItemHover: {
      main: "rgba(255, 255, 255, 0.2)",
    },

    // Text
    bigTitle: {
      lightBlue: "rgba(54, 151, 254, 1)",
      lightBlueHover: "rgba(47, 128, 237, 1)",
    },
    loginLink: {
      main: "#e0e0e0",
    },
    normalFontColor: {
      primary: "white",
      secondary: "rgb(169, 179, 187)",
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
      main: "rgba(97, 103, 208, 0.8)",
      onHover: "rgba(97, 103, 208, 1)",
      rippleSpan: "rgba(97, 103, 208, 0.9)",
      whenOpen: "rgba(30, 30, 30, 1)",
      searchIcon: "rgba(255, 255, 255, 0.7)",
    },

    // Company Detailed Page
    newsCardHover: {
      main: "rgba(255, 255, 255, 0.2)",
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
