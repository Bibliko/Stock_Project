import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";

import { Typography, Slide, Container } from "@material-ui/core";

import {
  ArrowDropUpRounded as ArrowDropUpRoundedIcon,
  ArrowDropDownRounded as ArrowDropDownRoundedIcon,
} from "@material-ui/icons";

const styles = (theme) => ({
  container: {
    display: "grid",
    paddingTop: "5px",
    paddingBottom: "5px",
    gridTemplateColumns: "1fr 1.25fr",
    gridTemplateRows: "1fr 1fr",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.paperBackground.onPage,
    gridGap: "2px",
    zIndex: theme.customZIndex.subNavbarCard,
  },
  smallText: {
    fontSize: "13.5px",
    color: theme.palette.normalFontColor.primary,
  },
  mediumText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },
  border: {
    borderLeft: `${theme.palette.secondary.main} solid 1px`,
  },
  arrowUp: {
    color: "#00E825",
  },
  arrowDown: {
    color: "#fd2222",
  },
});

function InfoCard(props) {
  const { classes, name, price, change, index, show } = props;
  return (
    <Slide appear={false} direction="down" in={show}>
      <Container
        className={clsx(classes.container, { [classes.border]: index })}
        id={`info-card-${index}`}
        maxWidth={false}
      >
        <Typography
          align={"center"}
          style={{ gridArea: "1 / 1 / 2 / 2" }}
          className={classes.smallText}
        >
          {name}
        </Typography>

        <Typography
          align={"center"}
          style={{ gridArea: "2 / 1 / 3 / 2" }}
          className={classes.smallText}
        >
          {`$${price}`}
        </Typography>

        <Typography
          align={"center"}
          style={{ gridArea: "1 / 2 / 3 / 3" }}
          className={clsx(classes.mediumText, {
            [classes.arrowUp]: change >= 0,
            [classes.arrowDown]: change < 0,
          })}
        >
          {change >= 0 ? (
            <ArrowDropUpRoundedIcon size={30} className={classes.arrowUp} />
          ) : (
            <ArrowDropDownRoundedIcon size={30} className={classes.arrowDown} />
          )}
          {`${change}%`}
        </Typography>
      </Container>
    </Slide>
  );
}

export default withStyles(styles)(InfoCard);
