import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import {
  TableRow,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Fab,
  Container,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { oneSecond } from "../../../utils/low-dependency/DayTimeUtil";
import {
  paperWhenHistoryEmpty,
} from "./helperComponents";

const styles = (theme) => ({
  pendingOrderContainerDiv: {
    width: "100%",
    marginTop: "24px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
  },
  tableContainer: {
    borderRadius: "4px",
    boxShadow: theme.customShadow.tableContainer,
  },
  tableCell: {
    minWidth: "100px",
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    borderWidth: "1px",
    borderColor: theme.palette.paperBackground.sub,
    borderStyle: "solid",
  },
  tableCellTransactionTime: {
    minWidth: "200px",
  },
  cellDiv: {
    fontSize: "medium",
    [theme.breakpoints.down("xs")]: {
      fontSize: "small",
    },
    display: "flex",
    alignItems: "center",
    "&.MuiTableSortLabel-root": {
      color: "white",
      "&.MuiTableSortLabel-active": {
        fontStyle: "italic",
        "&.MuiTableSortLabel-root": {
          "&.MuiTableSortLabel-active": {
            "& .MuiTableSortLabel-icon": {
              color: "white",
            },
          },
        },
      },
      "&:hover": {
        fontStyle: "italic",
      },
      "&:focus": {
        fontStyle: "italic",
      },
    },
  },
  emptyRowsPaper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "200px",
    color: "white",
    padding: 20,
    backgroundColor: theme.palette.paperBackground.onPage,
  },
  assignmentIcon: {
    height: "50px",
    width: "auto",
    marginBottom: "5px",
    [theme.breakpoints.down("xs")]: {
      height: "40px",
    },
  },
  "@keyframes bounceIcon": {
    "0%": { transform: "scale(1,1) translateY(0)" },
    "10%": { transform: "scale(1.1,.9) translateY(0)" },
    "30%": { transform: "scale(.9,1.1) translateY(-50px)" },
    "50%": { transform: "scale(1.05,.95) translateY(0)" },
    "57%": { transform: "scale(1,1) translateY(-7px)" },
    "64%": { transform: "scale(1,1) translateY(0)" },
    "100%": { transform: "scale(1,1) translateY(0)" },
  },
  assignmentIconAnimation: {
    animation: "2s infinite $bounceIcon",
    animationTimingFunction: "cubic-bezier(0.280, 0.840, 0.420, 1)",
  },
  assignmentWord: {
    fontSize: "large",
    [theme.breakpoints.down("xs")]: {
      fontSize: "medium",
    },
    textAlign: "center",
  },
  firstElementTopLeftRounded: {
    borderTopLeftRadius: "4px",
  },
  lastElementTopRightRounded: {
    borderTopRightRadius: "4px",
  },
  tablePagination: {
    color: "white",
  },
  tablePaginationSelectIcon: {
    color: "white",
  },
  tablePaginationActions: {
    "& .Mui-disabled": {
      color: theme.palette.disabled.main,
    },
  },
  skeleton: {
    width: "100%",
    height: "200px",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  filterButton: {
    "&.MuiFab-extended": {
      "&.MuiFab-sizeMedium": {
        width: "110px",
      },
    },
    backgroundColor: theme.palette.primary.subDark,
    "&:hover": {
      backgroundColor: theme.palette.primary.subDarkHover,
    },
    color: "white",
    position: "fixed",
    zIndex: theme.customZIndex.floatingToolButton,
    transition: "width 0.2s",
    top: theme.customMargin.topFloatingToolButton,
    [theme.breakpoints.down("xs")]: {
      top: theme.customMargin.smallTopFloatingToolButton,
    },
  },
  filterButtonNotExtended: {
    "&.MuiFab-extended": {
      "&.MuiFab-sizeMedium": {
        width: "40px",
      },
    },
  },
  filterIconMargin: {
    marginRight: "5px",
  },
  filteringContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 0,
    marginBottom: 24,
  },
  filterWord: {
    width: "100%",
    opacity: 1,
    color: "white",
    fontSize: "medium",
    transition: "font-size 0.2s",
  },
  filterWordHidden: {
    fontSize: 0,
  },
  title: {
    marginBottom: "30px",
    fontSize: "x-large",
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
})

class PendingOrderTableContainer extends React.Component {

  state = {
    hoverPaper: true,
    loading: true,
    openFilterDialog: false,
    isScrollingUp: true,
    isFirstInitializationEmpty: true,
  }

  scrollPosition;

  timeoutToChangePage;

  timeoutStartAnimationAgain;

  hoverPaper = () => {
    this.setState({
      hoverPaper: true,
    });
  };

  notHoverPaper = () => {
    this.setState({
      hoverPaper: false,
    });

    this.timeoutStartAnimationAgain = setTimeout(() => {
      this.setState({
        hoverPaper: true,
      });
    }, 3 * oneSecond);
  };

  componentDidMount() {
    this.setState({
      loading: false,
    })
  }

  componentWillUnmount() {
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {
    const { classes } = this.props;
    const {
      hoverPaper,
      loading,
      isFirstInitializationEmpty,
      openFilterDialog,
      isScrollingUp,

      transactions,
      transactionsLength,

      rowsLengthChoices,
      pageBase0,
      rowsPerPage,
      filters,

      names,
    } = this.state;

    return (
      <div className={classes.pendingOrderContainerDiv}>
        {isFirstInitializationEmpty &&
          !loading &&
          paperWhenHistoryEmpty(
            classes,
            hoverPaper,
            this.hoverPaper,
            this.notHoverPaper
          )}
        {!isFirstInitializationEmpty && !loading && (
          <React.Fragment>
            <TableContainer>
            <p>ádasds</p>
            </TableContainer>
          </React.Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(PendingOrderTableContainer))
);
