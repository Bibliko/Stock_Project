import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";

import {
  AppBar,
  Typography,
  Container,
  Slide,
  useMediaQuery,
  useScrollTrigger,
} from "@material-ui/core";

import InfoCard from "./InfoCard";

const styles = {
  subnav: {
    position: "fixed",
    top: "48px",
    zIndex: "0",
  },
  gridContainer: {
    display: "grid",
    justifyContent: "center",
    alignItems: "center",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    gridTemplateRows: "0.6fr 1fr",
    height: "100%",
  },
  clockContainer: {
    backgroundColor: "purple",
  },
};

const withMediaQuery = (...args) => Component => props => {
  const mediaQuery = useMediaQuery(...args);
  return <Component mediaQuery={mediaQuery} {...props} />;
};

function HideOnScroll(props) {
  const {
    children,
  } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

class SubNavbar extends React.Component {
  render() {
    const {
      classes,
      mediaQuery,
    } = this.props;
    const data = [
      ["GOOGL", 1616.95, 3.91],
      ["GOOGL", 1616.95, 3.91],
      ["GOOGL", 1616.95, 3.91],
      ["GOOGL", 1616.95, 3.91],
      ["GOOGL", 1616.95, 3.91],
    ]

    return (
        <HideOnScroll>
          <AppBar className={classes.subnav} style={{height: mediaQuery ? "60px" : "25px"}}>
            <Container
              container
              disableGutters
              className={classes.gridContainer}
              maxWidth={false}
            >
              <Typography
                align={"center"}
                className={classes.clockContainer}
                style={{gridArea: mediaQuery ? "1 / 1 / 2 / 6" : "1 / 1 / 3 / 6"}}
              >
                {"1232132313"}
              </Typography>

              { mediaQuery &&
                data.map((data, index) => { return (
                  <InfoCard name={data[0]} price={data[1]} change={data[2]} index={index}/>
                )})
              }
            </Container>
          </AppBar>
        </HideOnScroll>
    );
  }
}

export default withStyles(styles)(withMediaQuery("(min-width:800px)")(SubNavbar));
