import React from "react";
import { withRouter } from "react-router";

import PendingOrderTableContainer from "../../components/Table/PendingOrderTable/PendingOrderTableContainer";
import SpaceDivMainPages from "../../components/Space/SpaceDivMainPages";

import { withStyles } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    height: "75%",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
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

class PendingOrderPage extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Grid container spacing={4} className={classes.fullWidth}>
            <PendingOrderTableContainer />
            <SpaceDivMainPages />
        </Grid>
      </Container>
    );
  }
}

export default withStyles(styles)(withRouter(PendingOrderPage));
