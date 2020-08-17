const theme = {
  customWidth: {
    maxSearchFieldWithLogo: "360px",
    maxSearchFieldWidth: "235px",
  },
  customHeight: {
    appBarHeight: "60px",
    appBarHeightSmall: "50px",
  },
  customMargin: {
    topLayout: "100px",
    topLayoutSmall: "90px",

    topCountdown: "65px",
    topCountdownSmall: "55px",
  },
  customZIndex: {
    reminder: 10,
    countdown: 5,
    appBar: 1100, // This is already embedded in .MuiAppBar-root
    searchFieldContainer: 1000,
    searchMenu: 1200,
  },
  palette: {
    primary: {
      main: "#2196f3",
    },

    backgroundBlue: {
      main: "#619FD7",
    },

    appBarButtonBackground: {
      gradient: "linear-gradient(#66CCFF 20%, #6666FF 50%)",
    },

    paperBackground: {
      main: "#1E1E1E",
      onPage: "rgba(46, 44, 48, 1)",
      deepBlueTable: "rgba(26,22,75,1)",
      gradient: "linear-gradient(180deg, #1E1E1E 0%, #180B66 100%)",
    },

    tableBackground: {
      gradient: "linear-gradient(180deg, #1b163d 0%, #180f56 100%)",
    },

    menuBackground: {
      main: "#303030",
    },

    appBarBlue: {
      main: "#180B66",
    },

    barButton: {
      main: "linear-gradient(45deg, #2196f3, #03b6fc)",
    },

    subText: {
      main: "rgba(5, 5, 5, 1)",
    },

    succeed: {
      main: "#209A54",
    },

    fail: {
      main: "#DC3D4A",
    },

    gradientPaper: {
      main:
        "linear-gradient(180deg, #300B66 0%, rgba(255,255,255,0) 70%),linear-gradient(180deg, #FF3747 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, #FFFFFF 50%, rgba(255,255,255,0) 100%), #9ED2EF",
    },

    type: "light",
  },

  // Mui Pickers
  overrides: {
    MuiPickersToolbar: {
      root: {
        backgroundColor: "#180B66",
        color: "white",
      },
    },
    MuiPickersCalendarHeader: {
      root: {
        backgroundColor: "#2196f3",
        marginTop: '0px',
        marginBottom: '0px',
        minHeight: '50px',
        maxHeight: '50px',
        color: "white",
      },
    },
    MuiPickersCalendar: {
      daysHeader: {
        backgroundColor: "#303030",
        '& span': {
          color: 'white',
        },
      },
      root: {
        backgroundColor: "#303030",
      },
    },
    // MuiPickersArrowSwitcher:{
    //   root:{
    //     backgroundColor: "#180B66",
    //     color: "white",
    //   },
    // },
    MuiPickersYear: {
      yearButton:{
        "&:hover": {
          backgroundColor: "#2196f3",
        },
        "&$selected": {
          backgroundColor: "#2196f3",
        },
        "&$disabled": {
          color: 'rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.02)',
        },
      },
    },
    MuiPickersMonth: {
      root: {
        "&:hover": {
          backgroundColor: "#2196f3",
          color: "white",
        },
      },
    },
    MuiPickersDay: {
      root: {
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
        "&:hover": {
          backgroundColor: "#2196f3"
        },
        "&$selected": {
          backgroundColor: "#2196f3"
        },
        "&$disabled": {
          backgroundColor: 'rgba(255,255,255,0.02)'
        },
        "&$today": {
          backgroundColor: "red",
        },
      },
    },
    MuiPickersYearSelection: {
      root: {
        backgroundColor: "#303030",
        margin: "none",
        color: "white",
      },
    },
    MuiPickersMonthSelection: {
      root: {
        backgroundColor: "#303030",
        margin: "none",
        color: "white",
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
        backgroundColor: "#180B66",
        "& button": {
          color: "#2196f3",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.25)"
          },
        },
      },
    },
  },
  // Mui Pickers
};

export default theme;
