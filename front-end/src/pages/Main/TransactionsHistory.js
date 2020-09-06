import React from "react";
import { withRouter } from "react-router";

import TransactionsHistoryTableContainer from "../../components/Table/TransactionsHistoryTable/TransactionsHistoryTableContainer";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
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
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
});

class TransactionsHistoryPage extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Grid container spacing={4} className={classes.fullWidth}>
          <TransactionsHistoryTableContainer />
          <SpaceDivMainPages />
        </Grid>
      </Container>
    );
  }
}

export default withStyles(styles)(withRouter(TransactionsHistoryPage));
