import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
} from "@material-ui/core";

const styles = (theme) => ({
  avatar: {
    height: "200px",
    width: "200px",
    [theme.breakpoints.down("md")]: {
      height: "128px",
      width: "128px",
    },
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    color: theme.palette.appBarBlue.main,
  },
});

class AvatarSection extends React.Component {
  state = {
    show: false,
  };

  toggle = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  handleFile(e) {
    // const fileReader = new FileReader();
    // fileReader.readAsDataURL(e.target.files[0]);
    // console.log(fileReader);
  }

  render() {
    const { classes, avatarUrl } = this.props;

    return (
      <React.Fragment>
        <IconButton onClick={this.toggle}>
          <Avatar
            src={avatarUrl}
            className={classes.avatar}
          />
        </IconButton>
        <Dialog
          open={this.state.show}
          onClose={this.toggle}
          aria-labelledby="upload-dialog-title"
        >
          <DialogTitle id="upload-dialog-title">
            {" "}
            Upload your avatar{" "}
          </DialogTitle>
          <DialogContent>
            <input
              accept="image/*"
              // className={classes.input}
              style={{ display: "none" }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={this.handleFile}
            />
            <label htmlFor="raised-button-file">
              <Button variant="raised" component="span">
                Upload
              </Button>
            </label>
            <Button
              aria-label="save file"
              color="primary"
              size="medium"
              variant="contained"
              disableElevation
              className={classes.reminderButton}
              // onClick={this.submit}
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AvatarSection);
