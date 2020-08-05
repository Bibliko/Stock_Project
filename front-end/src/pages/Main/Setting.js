import React from "react";
import clsx from "clsx";
import { withRouter } from "react-router";

import { isEqual, pick, extend } from "lodash";

import { connect } from "react-redux";
import { userAction } from "../../redux/storeActions/actions";

import { changeUserData } from "../../utils/UserUtil";

import SettingNormalTextField from "../../components/TextField/SettingNormalTextField";
import SettingPasswordTextField from "../../components/TextField/SettingPasswordTextField";
import StickyReminder from "../../components/Reminder/StickyReminder";
import SelectBox from "../../components/SelectBox/SelectBox";

import { withStyles } from "@material-ui/core/styles";

import { Divider } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Avatar from "@material-ui/core/Avatar";

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
  gridContainer: {
    marginBottom: "30px",
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "15px",
      marginTop: "10px",
    },
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    flexBasis: "unset",
  },
  fullHeightWidth: {
    height: "100%",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  itemGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    minWidth: "150px",
  },
  gridTitle: {
    fontSize: "44px",
    [theme.breakpoints.down("md")]: {
      fontSize: "44px",
    },
    fontWeight: "bold",
    marginBottom: "5px",
  },
  divider: {
    width: "95%",
    margin: "auto",
    background: "white",
  },
  avatar: {
    height: "256px",
    width: "256px",
    [theme.breakpoints.down("md")]: {
      height: "128px",
      width: "128px",
    },
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    color: theme.palette.appBarBlue.main,
  },
});

class PasswordSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wrongPassword: false,
      invalidPassword: false,
      unmatchedPassword: false,
      input: {
        oldPassword: "",
        newPassword: "",
        confirmedPassword: "",
      },
    };
    this.initialState = JSON.parse(JSON.stringify(this.state));
    this.newPassword = this.props.oldPassword;
    this.hasError = false;
    this.checkOldPassword = this.checkOldPassword.bind(this);
    this.recordNewPassword = this.recordNewPassword.bind(this);
    this.recordConfirmedPassword = this.recordConfirmedPassword.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      oldPassword: nextProps.oldPassword,
    });
  }

  reset() {
    this.newPassword = this.props.oldPassword;
    this.setState(this.initialState);
  }

  createChangeLog() {
    return { password: this.newPassword };
  }

  checkOldPassword(e) {
    const input = { ...this.state.input, oldPassword: e.target.value };
    this.setState({
      input: input,
      wrongPassword: this.props.oldPassword !== e.target.value,
    });
    this.hasError =
      this.props.oldPassword !== e.target.value ||
      this.state.invalidPassword ||
      this.state.unmatchedPassword;
  }

  recordNewPassword(e) {
    const input = { ...this.state.input, newPassword: e.target.value };
    this.newPassword = e.target.value || this.props.oldPassword;
    this.setState({
      input: input,
      invalidPassword: !!this.newPassword && this.newPassword.length < 8,
      unmatchedPassword: this.state.input.confirmedPassword !== e.target.value,
    });
    this.hasError =
      this.state.wrongPassword ||
      (!!this.newPassword && this.newPassword.length < 8) ||
      this.state.input.confirmedPassword !== e.target.value;
    this.props.recordChanges(this.createChangeLog());
  }

  recordConfirmedPassword(e) {
    const input = { ...this.state.input, confirmedPassword: e.target.value };
    this.setState({
      input: input,
      unmatchedPassword: this.state.input.newPassword !== e.target.value,
    });
    this.hasError =
      this.state.wrongPassword ||
      this.state.invalidPassword ||
      this.state.input.newPassword !== e.target.value;
    this.props.recordChanges(this.createChangeLog());
  }

  render() {
    const { classes } = this.props;
    const {
      wrongPassword,
      invalidPassword,
      unmatchedPassword,
      input,
    } = this.state;

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={2}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={12} className={classes.itemGrid}>
            <SettingPasswordTextField
              value={input.oldPassword}
              name="Old Password"
              isInvalid={wrongPassword}
              helper="Incorrect password"
              onChange={this.checkOldPassword}
            />
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <SettingPasswordTextField
              value={input.newPassword}
              name="New Password"
              isInvalid={invalidPassword}
              helper="Password must contain at least 8 characters"
              onChange={this.recordNewPassword}
            />
          </Grid>
          <Grid item xs={12} className={classes.itemGrid}>
            <SettingPasswordTextField
              value={input.confirmedPassword}
              name="Confirm New Password"
              isInvalid={unmatchedPassword}
              helper="Password doesn't match"
              onChange={this.recordConfirmedPassword}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

class NameSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        firstName: this.props.firstName,
        lastName: this.props.lastName,
      },
    };
    this.hasError = false;
    this.initialState = JSON.parse(JSON.stringify(this.state));
    this.recordFirstName = this.recordFirstName.bind(this);
    this.recordLastName = this.recordLastName.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const input = {
      firstName: nextProps.firstName,
      lastName: nextProps.lastName,
    };
    this.setState({
      input: input,
    });
  }

  reset() {
    this.setState(this.initialState);
  }

  createChangeLog(firstName, lastName) {
    return { firstName, lastName };
  }

  recordFirstName(e) {
    const input = { ...this.state.input, firstName: e.target.value };
    this.setState({
      input: input,
    });
    this.hasError = !e.target.value || !this.state.input.lastName;
    this.props.recordChanges(
      this.createChangeLog(e.target.value, this.state.input.lastName)
    );
  }

  recordLastName(e) {
    const input = { ...this.state.input, lastName: e.target.value };
    this.setState({
      input: input,
    });
    this.hasError = !this.state.input.firstName || !e.target.value;
    this.props.recordChanges(
      this.createChangeLog(this.state.input.firstName, e.target.value)
    );
  }

  render() {
    const { input } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={2}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={6} className={classes.itemGrid}>
            <SettingNormalTextField
              name="First name"
              value={input.firstName}
              isInvalid={!input.firstName}
              helper="Cannot be empty"
              onChange={this.recordFirstName}
            />
          </Grid>
          <Grid item xs={6} className={classes.itemGrid}>
            <SettingNormalTextField
              name="Last name"
              value={input.lastName}
              isInvalid={!input.lastName}
              helper="Cannot be empty"
              onChange={this.recordLastName}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

class SelectSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        region: this.props.region,
        occupation: this.props.occupation,
      },
    };
    this.initialState = JSON.parse(JSON.stringify(this.state));
    this.recordRegion = this.recordRegion.bind(this);
    this.recordOccupation = this.recordOccupation.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const input = {
      region: nextProps.region,
      occupation: nextProps.occupation,
    };
    this.setState({
      input: input,
    });
  }

  reset() {
    this.setState(this.initialState);
  }

  createChangeLog(region, occupation) {
    return { region, occupation };
  }

  recordRegion(e) {
    const input = { ...this.state.input, region: e.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(e.target.value, this.state.input.occupation)
    );
  }

  recordOccupation(e) {
    const input = { ...this.state.input, occupation: e.target.value };
    this.setState({
      input: input,
    });
    this.props.recordChanges(
      this.createChangeLog(this.state.input.region, e.target.value)
    );
  }

  render() {
    const { classes } = this.props;
    const { input } = this.state;
    const occupations = ["Student", "Teacher", "Other"];
    const regions = [
      "Africa",
      "Asia",
      "The Caribbean",
      "Central America",
      "Europe",
      "North America",
      "Oceania",
      "South America",
    ];

    return (
      <div className={classes.fullWidth}>
        <Grid
          container
          spacing={2}
          direction="row"
          className={clsx(classes.fullHeightWidth, classes.gridContainer)}
        >
          <Grid item xs={6} className={classes.itemGrid}>
            <SelectBox
              name="Region"
              value={input.region}
              items={regions}
              onChange={this.recordRegion}
            />
          </Grid>
          <Grid item xs={6} className={classes.itemGrid}>
            <SelectBox
              name="Occupation"
              value={input.occupation}
              items={occupations}
              onChange={this.recordOccupation}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

class ErrorDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  toggleDialog() {
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

class AccountSetting extends React.Component {
  constructor(props) {
    super(props);
    this.error = false;
    this.hasChanges = false;
    this.userSession = pick(this.props.userSession, [
      "password",
      "firstName",
      "lastName",
      "avatarUrl",
      "region",
      "occupation",
    ]);

    this.userSession.firstName = this.userSession.firstName || "";
    this.userSession.lastName = this.userSession.lastName || "";

    this.changes = JSON.parse(JSON.stringify(this.userSession));

    this.recordChanges = this.recordChanges.bind(this);
    this.updateReminder = this.updateReminder.bind(this);
    this.reset = this.reset.bind(this);
    this.submit = this.submit.bind(this);

    this.reminderRef = React.createRef();
    this.nameSectionRef = React.createRef();
    this.passwordSectionRef = React.createRef();
    this.selectSectionRef = React.createRef();
    this.errorDialogRef = React.createRef();
  }

  recordChanges(newChanges = {}) {
    extend(this.changes, newChanges);
    this.error =
      this.nameSectionRef.current.hasError ||
      this.passwordSectionRef.current.hasError;
    console.log(this.error, this.nameSectionRef.current.hasError);
    this.updateReminder();
  }

  updateReminder() {
    if (this.hasChanges !== !isEqual(this.userSession, this.changes)) {
      this.reminderRef.current.toggleReminder();
      this.hasChanges = !isEqual(this.userSession, this.changes);
    }
  }

  reset() {
    this.recordChanges(this.userSession, false);
    this.passwordSectionRef.current.reset();
    this.nameSectionRef.current.reset();
    this.selectSectionRef.current.reset();
  }

  submit() {
    if (!this.error) {
      changeUserData(
        this.changes,
        this.props.userSession.email,
        this.props.mutateUser
      ).catch((err) => {
        console.log(err);
        this.errorDialogRef.current.toggleDialog();
      });
      this.userSession = JSON.parse(JSON.stringify(this.changes));
      this.updateReminder();
      this.passwordSectionRef.current.reset();
    } else {
      this.errorDialogRef.current.toggleDialog();
    }
  }

  componentDidMount() {
    console.log(this.props.userSession);
  }

  render() {
    const { classes } = this.props;

    return (
      <Container className={classes.root} disableGutters>
        <Avatar
          src={this.userSession.avatarUrl}
          variant="rounded"
          className={classes.avatar}
        />

        <NameSection
          id="name-section"
          ref={this.nameSectionRef}
          classes={classes}
          firstName={this.userSession.firstName}
          lastName={this.userSession.lastName}
          recordChanges={this.recordChanges}
        />

        <Divider variant="middle" className={classes.divider} />

        <PasswordSection
          id="password-section"
          ref={this.passwordSectionRef}
          classes={classes}
          oldPassword={this.userSession.password}
          recordChanges={this.recordChanges}
        />

        <Divider variant="middle" className={classes.divider} />

        <SelectSection
          id="select-section"
          ref={this.selectSectionRef}
          classes={classes}
          region={this.userSession.region}
          occupation={this.userSession.occupation}
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
          >
            Reset
          </Button>
          <Button
            aria-label="save changes"
            color="inherit"
            size="small"
            onClick={this.submit}
          >
            Save
          </Button>
        </StickyReminder>
        <ErrorDialog ref={this.errorDialogRef} />
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
