import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { getUserData } from "../../utils/UserUtil";

import TransactionHistoryTableContainer from "../../components/Table/TransactionHistoryTable/TransactionHistoryTableContainer";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      width: "85%",
      marginTop: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: "none",
  },
  fullWidth: {
    width: "100%",
    minHeight: "200px",
    padding: "24px",
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

class TransactionHistoryPage extends React.Component {
  state = {
    transactions: [],
  };

  componentDidMount() {
    console.log(this.props.userSession);

    const dataNeeded = {
      transactions: true,
    };
    getUserData(dataNeeded, this.props.userSession.email)
      .then((result) => {
        this.setState({
          transactions: result.transactions,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const compareKeys = ["email"];
    const nextPropsCompare = pick(nextProps.userSession, compareKeys);
    const propsCompare = pick(this.props.userSession, compareKeys);

    return (
      !isEqual(nextPropsCompare, propsCompare) ||
      !isEqual(nextState, this.state)
    );
  }

  render() {
    const { classes } = this.props;
    const { transactions } = this.state;

    return (
      <Container className={classes.root} disableGutters>
        <Grid container spacing={4} className={classes.fullWidth}>
          <Grid item xs={12} className={classes.itemGrid}>
            <TransactionHistoryTableContainer rows={transactions} />
          </Grid>
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(TransactionHistoryPage))
);
