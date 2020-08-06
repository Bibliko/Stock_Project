import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import { pick, extend } from 'lodash'

import { connect } from 'react-redux';
import { userAction } from '../../redux/storeActions/actions';

import { changeUserData } from '../../utils/UserUtil'

import SettingNormalTextField from '../../components/TextField/SettingNormalTextField';
import SettingPasswordTextField from '../../components/TextField/SettingPasswordTextField';
import StickyReminder from '../../components/Reminder/StickyReminder';
import SelectBox from '../../components/SelectBox/SelectBox';

import { withStyles } from '@material-ui/core/styles';

import { Divider, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Avatar from '@material-ui/core/Avatar';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = theme => ({
	root: {
		position: 'absolute',
		height: '75%',
		width: '75%',
		marginTop: '150px',
		[theme.breakpoints.down('xs')]: {
			width: '85%',
		},
		background: 'rgba(0,0,0,0)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		maxWidth: 'none',
	},
	gridContainer: {
		marginBottom: '30px',
		marginTop: '20px',
		[theme.breakpoints.down('xs')]: {
			marginBottom: '15px',
			marginTop: '10px',
		},
	},
	fullHeightWidth: {
		height: '100%',
		width: '100%'
	},
	fullWidth: {
		width: '100%',
	},
	itemGrid: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'column',
		minWidth: '150px',
	},
	passwordTitle: {
		color: 'white',
		fontSize: '20px',
		marginLeft: '40px',
		[theme.breakpoints.down('xs')]: {
			fontSize: '15px',
			marginLeft: '30px',
		},
		fontWeight: 'bold',
	},
	text: {
		fontSize: '18px',
		[theme.breakpoints.down('xs')]: {
			fontSize: 'small',
		},
	},
	divider: {
		width: '95%',
		margin: 'auto',
		background: 'white',
	},
	avatar: {
		height: '256px',
		width: '256px',
		[theme.breakpoints.down('md')]: {
			height: '128px',
			width: '128px',
		},
		backgroundColor: 'rgba(255, 255, 255, 0.85)',
		color: theme.palette.appBarBlue.main,
	},
	reminderButton: {
		marginLeft: '5px',
		marginRight: '5px',
		[theme.breakpoints.down('xs')]: {
			fontSize: '10px',
			margin: '0px',
		},
	},
});

const PasswordAccordion = withStyles((theme) => ({
	root: {
		marginLeft: '30px',
		marginRight: '30px',
		marginBottom: '30px',
		marginTop: '20px',
		[theme.breakpoints.down('xs')]: {
			marginBottom: '15px',
			marginTop: '10px',
			marginLeft: '17px',
			marginRight: '15px',
		},
		backgroundColor: 'transparent',
		boxShadow: 'none',
	},
	expanded: {},
}))(Accordion);

const PasswordAccordionSummary = withStyles((theme) => ({
	root: {
		backgroundColor: 'rgba(225,225,225,0.6)',
		'&:hover': {
			backgroundColor: 'rgba(225,225,225,0.7)'
		},
		marginLeft: '5px',
		marginRight: '5px',
	},
	expanded: {},
}))(AccordionSummary);

class SensitiveSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			wrongPassword: false,
			invalidPassword: false,
			unmatchedPassword: false,
			show: false,
			input: {
				email: this.props.email,
				oldPassword: '',
				newPassword: '',
				confirmedPassword: '',
			}
		};
		this.newPassword = this.props.oldPassword;
		this.hasError = false;
		this.checkOldPassword = this.checkOldPassword.bind(this);
		this.recordNewPassword = this.recordNewPassword.bind(this);
		this.recordConfirmedPassword = this.recordConfirmedPassword.bind(this);
		this.toggle = this.toggle.bind(this);
	}

	toggle() {
		this.setState({
			show: !this.state.show,
		});
		if(this.state.show)
			this.reset();
		this.props.recordChanges(this.createChangeLog());
	}

	reset() {
		this.newPassword = this.props.oldPassword;
		this.hasError = false;
		this.setState({
			wrongPassword: false,
			invalidPassword: false,
			unmatchedPassword: false,
			show: false,
			input: {
				email: this.props.email,
				oldPassword: '',
				newPassword: '',
				confirmedPassword: '',
			}
		});
	}

	createChangeLog() {
		return {password: this.newPassword};
	}

	checkOldPassword(e) {
		const input = { ...this.state.input, oldPassword: e.target.value };
		let wrongPassword = this.props.oldPassword !== e.target.value
		if(!e.target.value && !input.newPassword && !input.confirmedPassword)
			wrongPassword = false;
		this.setState({
			input: input,
			wrongPassword: wrongPassword,
		});
		this.hasError = wrongPassword
						|| this.state.invalidPassword
						|| this.state.unmatchedPassword;
	}

	recordNewPassword(e) {
		const input = { ...this.state.input, newPassword: e.target.value };
		this.newPassword = e.target.value || this.props.oldPassword;

		let wrongPassword = this.state.wrongPassword;
		if(e.target.value && !input.oldPassword)	// not empty and oldPassword is empty
			wrongPassword = true;
		else if(!e.target.value && !input.oldPassword && !input.confirmedPassword)	// everthing is empty
			wrongPassword = false;

		this.setState({
			input: input,
			wrongPassword: wrongPassword,
			invalidPassword: this.newPassword.length < 8,
			unmatchedPassword: input.confirmedPassword !== e.target.value
		});

		this.hasError = wrongPassword 
						|| (!!this.newPassword && this.newPassword.length < 8)
						|| (input.confirmedPassword !== e.target.value);
		this.props.recordChanges(this.createChangeLog());
	}

	recordConfirmedPassword(e) {
		const input = { ...this.state.input, confirmedPassword: e.target.value };
		let wrongPassword = this.state.wrongPassword;
		if(e.target.value && !input.oldPassword)	// not empty and oldPassword is empty
			wrongPassword = true;
		else if(!e.target.value && !input.oldPassword && !input.confirmedPassword)	// everthing is empty
			wrongPassword = false;

		this.setState({
			input: input,
			wrongPassword: wrongPassword,
			unmatchedPassword: input.newPassword !== e.target.value
		});

		this.hasError = wrongPassword
						|| this.state.invalidPassword
						|| (input.newPassword !== e.target.value);
		this.props.recordChanges(this.createChangeLog());
	}

	render() {
		const { classes } = this.props;
		const {
			show,
			wrongPassword,
			invalidPassword,
			unmatchedPassword,
			input,
		} = this.state;

		return(
			<div className={classes.fullWidth}>
				<Grid container spacing={2} direction='row' className={clsx(classes.fullHeightWidth, classes.gridContainer)}>
					<Grid item xs={12} className={classes.itemGrid}>
						<SettingNormalTextField
							name='Email'
							disabled={true}
							value={input.email}
							isInvalid={!input.email}
							helper='Cannot be empty'
							// onChange={}
						/>
					</Grid>
				</Grid>
				<Typography className={classes.passwordTitle}>
					Password
				</Typography>
				<PasswordAccordion expanded={show} onChange={this.toggle}>
					<PasswordAccordionSummary expandIcon={<ExpandMoreIcon/>} id="password-section">
						<Typography className={classes.text}>
							Change Password
						</Typography>
					</PasswordAccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2} direction='row' className={clsx(classes.fullHeightWidth, classes.gridContainer)}>
							<Grid item xs={12} className={classes.itemGrid}>
								<SettingPasswordTextField
									value={input.oldPassword}
									name='Current Password'
									isInvalid={wrongPassword}
									helper='Incorrect password'
									onChange={this.checkOldPassword}
								/>
							</Grid>
							<Grid item xs={12} className={classes.itemGrid}>
								<SettingPasswordTextField
									value={input.newPassword}
									name='New Password'
									isInvalid={invalidPassword}
									helper='Password must contain at least 8 characters'
									onChange={this.recordNewPassword}
								/>
							</Grid>
							<Grid item xs={12} className={classes.itemGrid}>
								<SettingPasswordTextField 
									value={input.confirmedPassword}
									name='Confirm New Password'
									isInvalid={unmatchedPassword}
									helper="Password doesn't match"
									onChange={this.recordConfirmedPassword}
								/>
							</Grid>
						</Grid>
					</AccordionDetails>
				</PasswordAccordion>
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
			}
		};
		this.hasError = false;
		this.recordFirstName = this.recordFirstName.bind(this);
		this.recordLastName = this.recordLastName.bind(this);
	}

	reset() {
		this.setState({
			input: {
				firstName: this.props.firstName,
				lastName: this.props.lastName,
			}
		});
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
		this.props.recordChanges(this.createChangeLog(e.target.value, this.state.input.lastName));
	}

	recordLastName(e) {
		const input = { ...this.state.input, lastName: e.target.value };
		this.setState({
			input: input,
		});
		this.hasError = !this.state.input.firstName || !e.target.value;
		this.props.recordChanges(this.createChangeLog(this.state.input.firstName, e.target.value));
	}

	render() {
		const { input } = this.state;
		const { classes } = this.props;

		return (
			<div className={classes.fullWidth}>
				<Grid container spacing={2} direction='row' className={clsx(classes.fullHeightWidth, classes.gridContainer)}>
					<Grid item xs={12} sm={6} className={classes.itemGrid}>
						<SettingNormalTextField
							name='First name'
							value={input.firstName}
							isInvalid={!input.firstName}
							helper='Cannot be empty'
							onChange={this.recordFirstName}
						/>
					</Grid>
					<Grid item xs={12} sm={6} className={classes.itemGrid}>
						<SettingNormalTextField 
							name='Last name'
							value={input.lastName}
							isInvalid={!input.lastName}
							helper='Cannot be empty'
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
			}
		};
		this.recordRegion = this.recordRegion.bind(this);
		this.recordOccupation = this.recordOccupation.bind(this);
	}

	reset() {
		this.setState({
			input: {
				region: this.props.region,
				occupation: this.props.occupation,
			}
		});
	}

	createChangeLog(region, occupation) {
		return { region, occupation };
	}

	recordRegion(e) {
		const input = { ...this.state.input, region: e.target.value };
		this.setState({
			input: input,
		});
		this.props.recordChanges(this.createChangeLog(e.target.value, this.state.input.occupation));
	}

	recordOccupation(e) {
		const input = { ...this.state.input, occupation: e.target.value };
		this.setState({
			input: input,
		});
		this.props.recordChanges(this.createChangeLog(this.state.input.region, e.target.value));
	}

	render() {
		const { classes } = this.props;
		const { input } = this.state;
		const occupations = [
			'Student',
			'Teacher',
			'Other',
		];
		const regions = [
			'Africa',
			'Asia',
			'The Caribbean',
			'Central America',
			'Europe',
			'North America',
			'Oceania',
			'South America',
		];

		return (
			<div className={classes.fullWidth}>
				<Grid container spacing={2} direction='row' className={clsx(classes.fullHeightWidth, classes.gridContainer)}>
					<Grid item xs={12} sm={6} className={classes.itemGrid}>
						<SelectBox
							name='Region'
							value={input.region}
							items={regions}
							onChange={this.recordRegion}
						/>
					</Grid>
					<Grid item xs={12} sm={6} className={classes.itemGrid}>
						<SelectBox
							name='Occupation'
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
			open: false
		};
		this.toggleDialog = this.toggleDialog.bind(this);
	}

	toggleDialog() {
		this.setState({
			open: !this.state.open
		});
	}   

	render(){
		return(
			<Dialog
				open={this.state.open}
				onClose={this.toggleDialog}
				aria-labelledby='error-dialog-title'
			>
				<DialogTitle id='error-dialog-title'> Failed to save changes </DialogTitle>
				<DialogContent>
					<DialogContentText id='error-dialog-helper'>
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

		this.changes = pick(this.props.userSession, [
			'password',
			'firstName',
			'lastName',
			'avatarUrl',
			'region',
			'occupation'
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
		return !!(Object.keys(this.changes).filter(key => this.changes[key] !== this.props.userSession[key]).length);
	}

	recordChanges(newChanges={}) {
		extend(this.changes, newChanges);
		this.error = this.nameSectionRef.current.hasError || this.sensitiveSectionRef.current.hasError;
		this.updateReminder();
	}

	updateReminder() {
		if(this.hasChanges !== this.compareChanges()) {
			this.reminderRef.current.toggleReminder();
			this.hasChanges = this.compareChanges();
		}
	}

	reset() {
		this.changes = pick(this.props.userSession, [
			'password',
			'firstName',
			'lastName',
			'avatarUrl',
			'region',
			'occupation'
		]);
		this.error = false;
		this.updateReminder();

		this.sensitiveSectionRef.current.reset();
		this.nameSectionRef.current.reset();
		this.selectSectionRef.current.reset();
	}

	submit() {
		if(!this.error) {
			changeUserData(
				this.changes,
				this.props.userSession.email,
				this.props.mutateUser
			)
			.then(() => {
				this.updateReminder();
				this.sensitiveSectionRef.current.reset();
			})
			.catch(err => {
					console.log(err);
					this.errorDialogRef.current.toggleDialog();
				}	
			);
		} else {
			this.errorDialogRef.current.toggleDialog();
		}
	}

	render() {
		const { classes, userSession } = this.props;

		return(
			<Container className={classes.root} disableGutters>
				<Avatar
					src={userSession.avatarUrl}
					variant = 'rounded'
					className={classes.avatar}
				/>

				<NameSection
					id='name-section'
					ref={this.nameSectionRef}
					classes={classes}
					firstName={userSession.firstName}
					lastName={userSession.lastName}
					recordChanges={this.recordChanges}
				/>

				<Divider variant='middle' className={classes.divider}/>
				
				<SensitiveSection
					id='sensitive-section'
					ref={this.sensitiveSectionRef}
					classes={classes}
					oldPassword={userSession.password}
					email={userSession.email}
					recordChanges={this.recordChanges}
				/>
				
				<Divider variant='middle' className={classes.divider}/>
				
				<SelectSection
					id='select-section'
					ref={this.selectSectionRef}
					classes={classes}
					region={userSession.region}
					occupation={userSession.occupation}
					recordChanges={this.recordChanges}
				/>

				<StickyReminder 
					ref={this.reminderRef}
					collapsible={false}
					message='You have unsaved changes'
					stickyPosition='bottom'
					visible={false}
				>
					<Button
						aria-label='reset form'
						color='inherit'
						size='small'
						onClick={this.reset}
						className={classes.reminderButton}
						style={{textDecoration: 'underline'}}
					>
						Reset
					</Button>
					<Button
						aria-label='save changes'
						color='primary'
						size='small'
						variant='contained'
						disableElevation
						className={classes.reminderButton}
						onClick={this.submit}
					>
						Save
					</Button>
				</StickyReminder>
				<ErrorDialog ref={this.errorDialogRef}/>
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