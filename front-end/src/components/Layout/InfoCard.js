import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";

import {
  Typography,
  Container,
} from "@material-ui/core";

const styles = {
  container: {
    display: "grid",
    paddingTop: "5px",
    paddingBottom: "5px",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "1fr 1fr",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1D212D",
  },
  smallText: {
    fontSize: "13.5px",
  },
  mediumText: {
    fontSize: "20px",
    color: "#00E825",
  },
  border: {
    borderLeft: "rgba(255, 255, 255, 0.55) solid 1px",
  },
};

function InfoCard(props) {
  const {
    classes,
    name,
    price,
    change,
    index,
  } = props;
  return (
    <Container
      className={clsx(classes.container, {[classes.border]: index})}
      id={`info-card-${index}`}
      maxWidth={false}
    >
      <Typography align={"center"} className={classes.smallText} style={{gridArea: "1 / 1 / 2 / 2"}}>
        {name}
      </Typography>

      <Typography align={"center"} className={classes.smallText} style={{gridArea: "2 / 1 / 3 / 2"}}>
        {price}
      </Typography>

      <Typography align={"center"} className={classes.mediumText} style={{gridArea: "1 / 2 / 3 / 3"}}>
        {change}
      </Typography>
    </Container>
  );
}

export default withStyles(styles)(InfoCard);
