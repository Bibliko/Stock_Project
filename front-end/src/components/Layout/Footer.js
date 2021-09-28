import React from "react";
import clsx from "clsx";

import { openInNewTab } from "../../utils/low-dependency/PageRedirectUtil";

import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Container,
  IconButton,
} from "@material-ui/core";

import FacebookIcon from "@material-ui/icons/Facebook";

const styles = (theme) => ({
  root: {
    background: theme.palette.appBar.main,
    position: "absolute",
    bottom: "0px",
    width: "100%",
  },
  container: {
    height: theme.customHeight.footerHeight,
    width: theme.customWidth.mainPageWidth,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 30px",
    [theme.breakpoints.down("xs")]: {
      height: theme.customHeight.footerHeightSmall,
      width: theme.customWidth.mainPageWidthSmall,
      flexDirection: "column",
      justifyContent: "space-around",
      padding: "5px 0px",
    },
  },
  text: {
    color: "white",
    fontSize: "small",
    fontWeight: "600",
    [theme.breakpoints.down("xs")]: {
      fontSize: "x-small",
    },
  },
  social: {
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
  },
  facebook: {
    color: "white",
    height: "24px",
    [theme.breakpoints.down("xs")]: {
      height: "18px",
    },
  },
});

function Footer(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <Typography className={clsx(classes.text, classes.social)}>
          Follow us
          <IconButton
            aria-label="facebook"
            className={classes.facebook}
            onClick={() => openInNewTab("https://www.facebook.com/bibilikoorg/")}
          >
            <FacebookIcon />
          </IconButton>
        </Typography>

        <Typography className={classes.text}>
          Bibliko © 2021 All Rights Reserved
        </Typography>
      </Container>
    </div>
  );
}

export default withStyles(styles)(Footer);
