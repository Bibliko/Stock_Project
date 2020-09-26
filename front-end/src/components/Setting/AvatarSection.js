import React from "react";
import storage from "../../firebase/firebaseStorage.js";

import { socket } from "../../App.js";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { changeUserData } from "../../utils/UserUtil";

import UploadFileDialog from "../Dialog/UploadFileDialog";
import Avatar from "./Avatar";


class AvatarSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      showDialog: false,
    };
  }

  toggleDialogOn = () => {
    this.setState({
      showDialog: true,
    });
  };

  toggleDialogOff = () => {
    this.setState({
      showDialog: false,
      file: null,
      loading: false,
      success: false,
      fail: false,
    });
  };

  setLoading = () => {
    this.setState({
      loading: true,
    });
  };

  setFail = () => {
    this.setState({
      success: false,
      fail: true,
      loading: false,
    });
  };

  setSuccess = () => {
    this.setState({
      success: true,
      fail: false,
      loading: false,
    });
  };

  handleFile = (event) => {
    this.setState({
      file: event.target.files[0],
    });
  };

  upload = () => {
    if (this.state.file) {
      const { file } = this.state;
      const extension = file.type.split("/").pop();
      const storageRef = storage.ref();
      const avatarRef = storageRef.child(
        `/userData/${this.props.userId}/avatar.${extension}`
      );
      this.setLoading();
      avatarRef
        .put(file)
        .then(() => {
          return avatarRef.getDownloadURL();
        })
        .then((downloadURL) => {
          return changeUserData(
            { avatarUrl: downloadURL },
            this.props.userSession.email,
            this.props.mutateUser,
            socket
          );
        })
        .then(() => {
          this.setSuccess();
        })
        .catch((err) => {
          this.setFail();
          console.log(err);
        });
    } else {
      this.setFail();
    }
  };

  render() {
    const { userSession } = this.props;
    const { showDialog, loading, fail, success, file } = this.state;

    return (
      <div>
        <Avatar
          avatarUrl={userSession.avatarUrl}
          handleClick={this.toggleDialogOn}
        />
        <UploadFileDialog
          inputType="image/*"
          show={showDialog}
          handleClose={this.toggleDialogOff}
          handleFile={this.handleFile}
          handleUpload={this.upload}
          loading={loading}
          fail={fail}
          success={success}
          fileName={file && file.name}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AvatarSection);
