import React from "react";
import Typography from "@material-ui/core/Typography";

class Test extends React.Component {
  state = {};

  componentDidMount() {
    console.log("mount");
  }

  componentDidUpdate() {
    console.log("update");
  }

  componentWillUnmount() {
    console.log("unmount");
  }

  componentWillUpdate() {
    console.log("willUpdate");
  }

  render() {
    return <Typography>Hi</Typography>;
  }
}

export default Test;
