import React from "react";
import clsx from "clsx";

import { withStyles } from "@material-ui/core/styles";

import {
  Typography,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@material-ui/core";

import { CloudUpload as CloudUploadIcon } from "@material-ui/icons";

// Use Ref to toggle on Dialog and set [loading, fail, success] feedback

const styles = (theme) => ({
  fullHeigthWidth: {
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  paper: {
    maxWidth: "330px",
    minWidth: "220px",
    backgroundColor: theme.palette.paperBackground.onPage,
    color: "white",
  },
  iconButton: {
    color: "white",
  },
  dialogTitle: {
    display: "flex",
    padding: "10px",
    justifyContent: "center",
  },
  dialogContent: {
    padding: "10px",
  },
  buttonSuccess: {
    backgroundColor: "rgb(50,205,50)",
    "&:hover": {
      backgroundColor: "rgb(34,139,34)",
    },
  },
  buttonFail: {
    backgroundColor: "red",
    "&:hover": {
      backgroundColor: "rgb(178,34,34)",
    },
  },
  progress: {
    color: "green",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  buttonWrapper: {
    position: "relative",
  },
  fileNameWrapper: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "10rem",
  },
});

function UploadFileDialog(props) {
  const {
    classes,
    inputType,
    show,
    handleClose,
    handleFile,
    handleUpload,
    loading,
    success,
    fail,
    fileName,
  } = props;
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
    [classes.buttonFail]: fail,
  });

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      aria-labelledby="upload-dialog-title"
      aria-describedby="upload-content"
      fullWidth={true}
      maxWidth={"md"}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle id="upload-dialog-title" className={classes.dialogTitle}>
        Upload your avatar
      </DialogTitle>
      <DialogContent id="upload-content" className={classes.dialogContent}>
        <Grid
          container
          spacing={1}
          direction="row"
          className={classes.fullHeightWidth}
        >
          <Grid
            item
            xs={2}
            sytle={{ alignItems: "flex-end" }}
            className={classes.itemGrid}
          >
            <span>
              <input
                accept={inputType}
                style={{ display: "none" }}
                id="raised-button-file"
                multiple
                type="file"
                onChange={handleFile}
              />
              <label htmlFor="raised-button-file">
                <IconButton
                  variant="raised"
                  component="span"
                  className={classes.iconButton}
                >
                  <CloudUploadIcon />
                </IconButton>
              </label>
            </span>
          </Grid>
          <Grid item xs={6} className={classes.itemGrid}>
            <div className={classes.fileNameWrapper}>
              <Typography noWrap component="span">
                {fileName || "No file chosen"}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={4} className={classes.itemGrid}>
            <div
              className={clsx(classes.buttonWrapper, classes.fullHeigthWidth)}
            >
              <Button
                fullWidth
                aria-label="save file"
                color="primary"
                size="medium"
                variant="contained"
                disableElevation
                disabled={loading}
                className={buttonClassname}
                onClick={handleUpload}
              >
                Save
              </Button>
              {loading && (
                <CircularProgress size={24} className={classes.progress} />
              )}
            </div>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default withStyles(styles)(UploadFileDialog);
