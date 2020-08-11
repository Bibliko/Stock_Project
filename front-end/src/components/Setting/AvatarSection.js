import React from 'react';

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { changeUserData } from "../../utils/UserUtil";

import UploadFileDialog from '../Dialog/UploadFileDialog';
import Avatar from './Avatar';

var storage = require('../../firebase/firebaseStorage.js');

class AvatarSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
    this.dialogRef = React.createRef();
  }

  handleFile = (event) => {
    this.setState({
      file: event.target.files[0]
    });
    this.dialogRef.current.updateFile(event.target.files[0].name);
  }

  openDialog = () => {
    this.dialogRef.current.toggleOn();
  }

  upload = () => {
    if (this.state.file && this.dialogRef.current.state.fileName) {
      const { file } = this.state;
      const extension = file.type.split('/').pop();
      const storageRef = storage.ref();
      const avatarRef = storageRef.child(`userData/${this.props.userId}/avatar.${extension}`);
      console.log(avatarRef);
      this.dialogRef.current.loading();
      const upload = avatarRef.put(file);

      upload.on(
        'state_changed',
        () => {},

        function error() {
          this.dialogRef.current.fail();
        }.bind(this),

        function complete() {
          this.dialogRef.current.success();
          const thumbnailRef= storageRef.child(`userData/${this.props.userId}/avatar_200x200.${extension}`);
          thumbnailRef.getDownloadURL()
          .then(function(downloadURL) {
            changeUserData(
              { avatarUrl: downloadURL },
              this.props.userSession.email,
              this.props.mutateUser
            )
            .catch((err) => {
              console.log(err);
            });
          }.bind(this))
          .catch((err) => {
            console.log(err);
          });
        }.bind(this)
      ).bind(this);
    } else {
      this.dialogRef.current.fail();
    }
  }

  render() {
    const { userSession } = this.props;

    return (
      <React.Fragment>
        <Avatar
          avatarUrl={userSession.avatarUrl}
          handleClick={this.openDialog}
        />
        <UploadFileDialog
          ref={this.dialogRef}
          inputType='image/*'
          handleFile={this.handleFile}
          handleUpload={this.upload}
          fileName={this.state.file && this.state.file.name}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
  mutateUser: (userProps) => dispatch(userAction("default", userProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AvatarSection);
