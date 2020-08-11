import React from "react";
import { withRouter } from "react-router";

import { pick, extend } from "lodash";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { changeUserData } from "../../utils/UserUtil";

// import storage from '../../../firebase'

import StickyReminder from "../../components/Reminder/StickyReminder";
import SensitiveSection from "../../components/Setting/SensitiveSection";
import NameSection from "../../components/Setting/NameSection";
import SelectSection from "../../components/Setting/SelectSection";
import TextDialog from "../../components/Dialog/TextDialog";
import AvatarSection from "../../components/Setting/AvatarSection";

import { withStyles } from "@material-ui/core/styles";

import { Divider, Button, Container } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    position: "absolute",
    height: "75%",
    width: "75%",
    marginTop: "150px",
    [theme.breakpoints.down("xs")]: {
      width: "85%",
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    maxWidth: "none",
  },
  divider: {
    width: "95%",
    marginTop: "30px",
    marginBottom: "10px",
    background: "white",
  },
  reminderButton: {
    marginLeft: "5px",
    marginRight: "5px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "10px",
      margin: "0px",
    },
  },
});

class AccountSetting extends React.Component {
  constructor(props) {
    super(props);
    this.error = false;
    this.hasChanges = false;

    this.changes = pick(this.props.userSession, [
      "password",
      "firstName",
      "lastName",
      "avatarUrl",
      "region",
      "occupation",
    ]);

    this.recordChanges = this.recordChanges.bind(this);
    this.updateReminder = this.updateReminder.bind(this);
    this.reset = this.reset.bind(this);
    this.submit = this.submit.bind(this);

    this.reminderRef = React.createRef();
    this.nameSectionRef = React.createRef();
    this.sensitiveSectionRef = React.createRef();
    this.selectSectionRef = React.createRef();
    this.errorDialogRef = React.createRef();
  }

  compareChanges() {
    return !!Object.keys(this.changes).filter(
      (key) => this.changes[key] !== this.props.userSession[key]
    ).length;
  }

  recordChanges(newChanges = {}) {
    extend(this.changes, newChanges);
    this.error =
      this.nameSectionRef.current.hasError ||
      this.sensitiveSectionRef.current.hasError;
    this.updateReminder();
  }

  updateReminder() {
    if (this.hasChanges !== this.compareChanges()) {
      this.reminderRef.current.toggleReminder();
      this.hasChanges = this.compareChanges();
    }
  }

  reset() {
    this.changes = pick(this.props.userSession, [
      "password",
      "firstName",
      "lastName",
      "region",
      "occupation",
    ]);
    this.error = false;
    this.updateReminder();

    this.sensitiveSectionRef.current.reset();
    this.nameSectionRef.current.reset();
    this.selectSectionRef.current.reset();
  }

  submit() {
    if (!this.error) {
      const { firstName, lastName, region, occupation } = this.changes;
      let hasFinishedSettingUpAccount = false;
      if (firstName && lastName && region && occupation) {
        hasFinishedSettingUpAccount = true;
      }
      this.changes.hasFinishedSettingUp = hasFinishedSettingUpAccount;

      changeUserData(
        this.changes,
        this.props.userSession.email,
        this.props.mutateUser
      )
        .then(() => {
          this.updateReminder();
          this.sensitiveSectionRef.current.reset();
        })
        .catch((err) => {
          console.log(err);
          this.errorDialogRef.current.toggleDialog();
        });
    } else {
      this.errorDialogRef.current.toggleDialog();
    }
  }

  render() {
    const { classes, userSession } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <AvatarSection userId={userSession.id}/>

        <NameSection
          id="name-section"
          ref={this.nameSectionRef}
          firstName={userSession.firstName}
          lastName={userSession.lastName}
          recordChanges={this.recordChanges}
        />

        <Divider variant="middle" className={classes.divider} />

        <SensitiveSection
          id="sensitive-section"
          ref={this.sensitiveSectionRef}
          oldPassword={userSession.password}
          email={userSession.email}
          recordChanges={this.recordChanges}
        />

        <Divider variant="middle" className={classes.divider} />

        <SelectSection
          id="select-section"
          ref={this.selectSectionRef}
          region={userSession.region}
          occupation={userSession.occupation}
          recordChanges={this.recordChanges}
        />

        <StickyReminder
          ref={this.reminderRef}
          collapsible={false}
          message="You have unsaved changes"
          stickyPosition="bottom"
          visible={false}
        >
          <Button
            aria-label="reset form"
            color="inherit"
            size="small"
            onClick={this.reset}
            className={classes.reminderButton}
            style={{ textDecoration: "underline" }}
          >
            Reset
          </Button>
          <Button
            aria-label="save changes"
            color="primary"
            size="small"
            variant="contained"
            disableElevation
            className={classes.reminderButton}
            onClick={this.submit}
          >
            Save
          </Button>
        </StickyReminder>
        <TextDialog
          ref={this.errorDialogRef}
          title='Failed to save changes'
          content={'Please check your information and try again'}
        />
      </Container>
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
)(withStyles(styles)(withRouter(AccountSetting)));
