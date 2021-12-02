import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";

/*
  props: {
    title: string,
    content: string
  }

  Use ref to toggle on
*/

class TextDialog extends React.Component {
  state = {
    open: false,
  };

  toggleDialog = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const { title, content } = this.props;

    return (
      <Dialog
        open={this.state.open}
        onClose={this.toggleDialog}
        aria-labelledby="popup-dialog-title"
      >
        <DialogTitle id="popup-dialog-title">
          {" "}
          {title}{" "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="popup-dialog-content">
            {content}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}

export default TextDialog;
