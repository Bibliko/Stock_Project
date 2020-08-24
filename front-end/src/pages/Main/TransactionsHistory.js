import React from "react";
import { isEqual, pick } from "lodash";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { getParsedCachedPaginatedTransactionsHistoryList } from "../../utils/RedisUtil";

import TransactionsHistoryTableContainer from "../../components/Table/TransactionsHistoryTable/TransactionsHistoryTableContainer";

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
});

class TransactionsHistoryPage extends React.Component {
  state = {
    transactions: [],
  };

  componentDidMount() {
    console.log(this.props.userSession);

    getParsedCachedPaginatedTransactionsHistoryList(
      this.props.userSession.email,
      1
    )
      .then((transactions) => {
        this.setState({
          transactions,
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
          <TransactionsHistoryTableContainer rows={transactions} />
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(TransactionsHistoryPage))
);
