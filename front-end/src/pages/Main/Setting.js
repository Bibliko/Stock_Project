import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";
import { socket } from "../../App";

import { isEqual, pick, extend } from "lodash";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { changeUserData } from "../../utils/UserUtil";

// import storage from '../../../firebase'

import StickyReminder from "../../components/Reminder/StickyReminder";
import SensitiveSection from "../../components/Setting/SensitiveSection";
import BasicSection from "../../components/Setting/BasicSection";
import SelectSection from "../../components/Setting/SelectSection";
import TextDialog from "../../components/Dialog/TextDialog";
import AvatarSection from "../../components/Setting/AvatarSection";

import { withStyles } from "@material-ui/core/styles";

import { Divider, Button, Container } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    position: "absolute",
    width: theme.customWidth.mainPageWidth,
    marginTop: theme.customMargin.topLayout,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.customMargin.topLayoutSmall,
    },
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    maxWidth: "none",
  },
  divider: {
    width: "98%",
    marginTop: "15px",
    marginBottom: "15px",
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
  saveButton: {
    color: theme.palette.normalFontColor.primary,
    backgroundColor: `${theme.palette.primary.main} !important`,
    "&:hover": {
      backgroundColor: `${theme.palette.primary.hover} !important`,
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
      "dateOfBirth",
      "gender",
      "region",
      "occupation",
    ]);

    this.reminderRef = React.createRef();
    this.basicSectionRef = React.createRef();
    this.sensitiveSectionRef = React.createRef();
    this.selectSectionRef = React.createRef();
    this.errorDialogRef = React.createRef();
  }

  compareChanges() {
    return !!Object.keys(this.changes).filter((key) => {
      return typeof this.changes[key] === "object"
        ? !isEqual(this.changes[key], this.props.userSession[key])
        : this.changes[key] !== this.props.userSession[key];
    }).length;
  }

  recordChanges = (newChanges = {}) => {
    extend(this.changes, newChanges);
    this.error =
      this.basicSectionRef.current.hasError ||
      this.sensitiveSectionRef.current.hasError;
    this.updateReminder();
  };

  updateReminder = () => {
    if (this.hasChanges !== this.compareChanges()) {
      this.reminderRef.current.toggleReminder();
      this.hasChanges = this.compareChanges();
    }
  };

  reset = () => {
    this.changes = pick(this.props.userSession, [
      "password",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "region",
      "occupation",
    ]);
    this.error = false;
    this.updateReminder();

    this.sensitiveSectionRef.current.reset();
    this.basicSectionRef.current.reset();
    this.selectSectionRef.current.reset();
  };

  submit = () => {
    if (!this.error) {
      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        region,
        occupation,
      } = this.changes;
      let hasFinishedSettingUpAccount = false;
      if (
        firstName &&
        lastName &&
        dateOfBirth &&
        gender &&
        region &&
        occupation
      ) {
        hasFinishedSettingUpAccount = true;
      }
      this.changes.hasFinishedSettingUp = hasFinishedSettingUpAccount;

      changeUserData(
        this.changes,
        this.props.userSession.email,
        this.props.mutateUser,
        socket
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
  };

  shouldComponentUpdate(nextProps, nextState) {
    const userSessionKeys = [
      "email",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "password",
      "region",
      "occupation",
    ];
    const compareKeys = [
      "classes",
      ...userSessionKeys.map((key) => "userSession." + key),
    ];
    const nextPropsCompare = pick(nextProps, compareKeys);
    const propsCompare = pick(this.props, compareKeys);

    return !isEqual(nextPropsCompare, propsCompare);
  }

  render() {
    const { classes, userSession } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <AvatarSection userId={userSession.id} />

        <BasicSection
          id="basic-section"
          ref={this.basicSectionRef}
          firstName={userSession.firstName}
          lastName={userSession.lastName}
          dateOfBirth={userSession.dateOfBirth}
          gender={userSession.gender}
          recordChanges={this.recordChanges}
        />

        <Divider variant="middle" className={classes.divider} />

        <SensitiveSection
          id="sensitive-section"
          ref={this.sensitiveSectionRef}
          oldPassword={userSession.password}
          email={userSession.email}
          recordChanges={this.recordChanges}
          mutateUser={this.props.mutateUser}
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
            size="small"
            variant="contained"
            disableElevation
            className={clsx(classes.reminderButton, classes.saveButton)}
            onClick={this.submit}
          >
            Save
          </Button>
        </StickyReminder>
        <TextDialog
          ref={this.errorDialogRef}
          title="Failed to save changes"
          content={"Please check your information and try again"}
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
