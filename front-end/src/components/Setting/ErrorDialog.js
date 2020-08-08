import React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";

class ErrorDialog extends React.Component {
  state = {
    open: false,
  };

  toggleDialog = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.toggleDialog}
        aria-labelledby="error-dialog-title"
      >
        <DialogTitle id="error-dialog-title">
          {" "}
          Failed to save changes{" "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-helper">
            Please check your information and try again
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}

export default ErrorDialog;
