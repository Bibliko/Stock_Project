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
};

export default theme;
