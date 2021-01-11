/* 
  palette:
  - Basic
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
    tableContainer:
      "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  customWidth: {
    maxSearchFieldWithLogo: "370px",
    maxSearchFieldWidth: "240px",

    maxMostGainers: "400px",
    maxMostGainersChip: "95px",

    mainPageWidth: "90%",
    mainSkeletonWidth: "100%",

    redirectingPaper: "90%",
  },
  customHeight: {
    appBarHeight: "60px",
    appBarHeightSmall: "50px",

    subBarHeight: "80px",
    subBarHeightSmall: "25px",

    redirectingPaper: "200px",

    settingTextField: "45px",
    settingTextFieldSmall: "35px",

    mostGainersCard: "50px",
  },
  customMargin: {
    appBarPadding: "20px",

    topLayout: "100px",
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
    subNavbar: 20,
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

      subDarker: "rgba(80, 60, 190, 1)",
    },

    secondary: {
      // Light Blue + Green
      main: "rgba(128, 222, 255, 1)",
      hover: "rgba(128, 222, 255, 0.3)",
      mainHover: "rgba(52, 198, 246, 1)",
    },

    gradient: {
      main:
        "linear-gradient(90deg, rgba(138, 118, 255, 1), rgba(97, 213, 255, 1))", // Used for titles
    },

    fail: {
      // Red
      main: "rgba(255, 105, 105, 1)",
      hover: "rgba(255, 105, 105, 0.3)",
      mainHover: "rgba(230, 60, 60, 1)",
    },

    disabled: {
      whiteColor: "rgba(255, 255, 255, 0.3)",
    },

    // App Bar
    appBarBlue: {
      // main: "linear-gradient(45deg, #141466 20%, #2929CC 100%)",
      main: "rgba(31, 47, 152, 1)",

      // Grey
      main: "rgba(255, 255, 255, 0.3)",
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
        backgroundColor: "rgba(0, 0, 0, 1)",
        color: "rgba(128, 222, 255, 1)",
      },
      dateTitleContainer: {
        color: "white",
      },
    },

    MuiPickersCalendarHeader: {
      root: {
        backgroundColor: "rgba(104, 80, 230, 1)",
        marginTop: "0px",
        marginBottom: "0px",
        minHeight: "50px",
        maxHeight: "50px",
        color: "white",
      },
      monthTitleContainer: {
        color: "white",
      },
      yearSelectionSwitcher: {
        color: "white",
      },
    },
    MuiPickersCalendar: {
      daysHeader: {
        backgroundColor: "rgba(0, 0, 0, 1)",
        "& span": {
          color: "white",
        },
      },
      root: {
        backgroundColor: "rgba(0, 0, 0, 1)",
      },
    },
    MuiPickersArrowSwitcher: {
      iconButton: {
        backgroundColor: "unset",
        color: "white",
      },
    },

    MuiPickersYear: {
      yearButton: {
        "&:hover": {
          backgroundColor: "rgba(104, 80, 230, 1)",
        },
        "&$selected": {
          backgroundColor: "rgba(104, 80, 230, 1)",
        },
        "&$disabled": {
          color: "rgba(255, 255 , 255, 0.2)",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiPickersMonth: {
      root: {
        "&:hover": {
          backgroundColor: "rgba(136, 120, 255, 1)",
          color: "white",
        },
        "&.Mui-selected": {
          color: "rgba(136, 120, 255, 1)",
        },
      },
    },
    MuiPickersDay: {
      root: {
        color: "white",
        border: "unset",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        transition: "unset",
        "&:hover": {
          backgroundColor: "rgba(104, 80, 230, 0.8)",
          "&.Mui-selected": {
            backgroundColor: "rgba(104, 80, 230, 0.8)",
          },
        },
        "&:focus": {
          backgroundColor: "rgba(104, 80, 230, 1)",
          "&.Mui-selected": {
            backgroundColor: "rgba(104, 80, 230, 1)",
          },
        },
        "&$selected": {
          backgroundColor: "rgba(104, 80, 230, 1)",
        },
        "&$disabled": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "rgba(255, 255, 255, 0.5)",
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
        backgroundColor: "rgba(0, 0, 0, 1)",
        margin: "none",
        color: "white",
      },
    },
    MuiPickersMonthSelection: {
      root: {
        backgroundColor: "rgba(0, 0, 0, 1)",
        margin: "none",
        color: "white",
        width: "unset",
      },
    },

    MuiFormHelperText: {
      root: {
        color: "rgba(128, 222, 255, 1)",
      },
    },

    MuiPickersBasePicker: {
      pickerViewLandscape: {
        padding: "none",
        backgroundColor: "rgba(30, 33, 36, 1)",
      },
      pickerView: {
        backgroundColor: "rgba(30, 33, 36, 1)",
      },
    },
    MuiPickersModalDialog: {
      dialogAction: {
        backgroundColor: "rgba(0, 0, 0, 1)",
        "& button": {
          color: "rgba(128, 222, 255, 1)",
          "&:hover": {
            backgroundColor: "rgba(128, 222, 255, 0.2)",
          },
        },
      },
    },

    MuiPickersCalendarView: {
      viewTransitionContainer: {
        backgroundColor: "rgba(0, 0, 0, 1)",
      },
    },
    MuiPickersMobileKeyboardInputView: {
      root: {
        backgroundColor: "rgba(0, 0, 0, 1)",
      },
    },

    // Mui Popover
    MuiPopover: {
      paper: {
        backgroundColor: "rgba(59, 64, 68, 1)", // theme.palette.paperBackground.onPageLight
        color: "white",
      },
    },

    // Mui TextField
    MuiTextField: {
      root: {
        borderRadius: "4px",
      },
    },

    // Mui Select
    MuiSelect: {
      icon: {
        color: "white",
      },
    },

    // Mui IconButton
    MuiIconButton: {
      root: {
        color: "white",
      },
    },
  },
};

export default theme;
