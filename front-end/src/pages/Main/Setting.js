import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import { isEqual, pick, extend } from 'lodash'

import { connect } from 'react-redux';
import {
    userAction,
} from '../../redux/storeActions/actions';

import { changeUserData } from '../../utils/UserUtil'

import SettingNormalTextField from '../../components/TextField/SettingNormalTextField';
import SettingPasswordTextField from '../../components/TextField/SettingPasswordTextField';
import StickyReminder from '../../components/Reminder/StickyReminder';

import { withStyles } from '@material-ui/core/styles';

import { Divider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

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
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		margin: 'auto',
		flexBasis: 'unset',
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
	gridTitle: {
		fontSize: '44px',
		[theme.breakpoints.down('md')]: {
			fontSize: '44px'
		},
		fontWeight: 'bold',
		marginBottom: '5px'
	},
	divider: {
		width: '95%',
		margin: 'auto',
		background: 'white',
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
				oldPassword: '',
				newPassword: '',
				confirmedPassword: '',
			}
		};
		this.initialState = JSON.parse(JSON.stringify(this.state));
		this.newPassword = this.props.oldPassword;
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
		return {password: this.newPassword};
	}

	checkOldPassword(e) {
		const input = { ...this.state.input, oldPassword: e.target.value };
		this.setState({
			input: input,
			wrongPassword: this.props.oldPassword !== e.target.value
		});
	}

	recordNewPassword(e) {
		const input = { ...this.state.input, newPassword: e.target.value };
		this.newPassword = e.target.value || this.props.oldPassword;
		this.setState({
			input: input,
			invalidPassword: this.newPassword && this.newPassword.length < 8,
			unmatchedPassword: this.state.input.confirmedPassword !== e.target.value
		});
		this.props.recordChanges(this.createChangeLog(), this.wrongPassword || this.invalidPassword || this.unmatchedPassword);
	}

	recordConfirmedPassword(e) {
		const input = { ...this.state.input, confirmedPassword: e.target.value };
		this.setState({
			input: input,
			unmatchedPassword: this.state.input.newPassword !== e.target.value
		});
		this.props.recordChanges(this.createChangeLog(), this.wrongPassword || this.invalidPassword || this.unmatchedPassword);
	}

	render() {
		const { classes } = this.props;
		const {
			wrongPassword,
			invalidPassword,
			unmatchedPassword,
			input,
		} = this.state;

		return(
			<div className={classes.fullWidth}>
				<Grid container spacing={2} direction="row" className={clsx(classes.fullHeightWidth, classes.gridContainer)}>
					<Grid item xs={12} className={classes.itemGrid}>
						<SettingPasswordTextField
							value={input.oldPassword}
							name='Old Password'
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
		this.initialState = JSON.parse(JSON.stringify(this.state));
		this.recordFirstName = this.recordFirstName.bind(this);
		this.recordLastName = this.recordLastName.bind(this);
	}

	componentWillReceiveProps(nextProps) {
        this.setState({
            firstName: nextProps.firstName,
            lastName: nextProps.lastName,
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
		this.props.recordChanges(this.createChangeLog(e.target.value, this.state.input.lastName), false);
	}

	recordLastName(e) {
		const input = { ...this.state.input, lastName: e.target.value };
		this.setState({
			input: input,
		});
		this.props.recordChanges(this.createChangeLog(this.state.input.firstName, e.target.value), false);
	}

	render() {
		const { input } = this.state;
		const { classes } = this.props;

		return (
			<div className={classes.fullWidth}>
				<Grid container spacing={2} direction="row" className={clsx(classes.fullHeightWidth, classes.gridContainer)}>
					<Grid item xs={6} className={classes.itemGrid}>
						<SettingNormalTextField
							name='First name'
							value={input.firstName}
							onChange={this.recordFirstName}
						/>
					</Grid>                
					<Grid item xs={6} className={classes.itemGrid}>
						<SettingNormalTextField 
							name='Last name'
							value={input.lastName}
							onChange={this.recordLastName}
						/>
					</Grid>
				</Grid>
			</div>
		);
	}
}

class AccountSetting extends React.Component {
	constructor(props) {
		super(props);
		this.error = false;
		this.hasChanges = false;
		this.userSession = pick(this.props.userSession, [
			'password',
			'firstName',
			'lastName',
			'avatarUrl',
			'region',
			'occupation'
		]);

		this.userSession.firstName = this.userSession.firstName || '';
		this.userSession.lastName = this.userSession.lastName || '';

		this.changes = JSON.parse(JSON.stringify(this.userSession));

		this.recordChanges = this.recordChanges.bind(this);
		this.updateReminder = this.updateReminder.bind(this);
		this.reset = this.reset.bind(this);
		this.submit = this.submit.bind(this);

		this.reminderRef = React.createRef();
		this.nameSectionRef = React.createRef();
		this.passwordSectionRef = React.createRef();
	}

	recordChanges(newChanges, error) {
		extend(this.changes, newChanges);
		this.error = error;
		this.updateReminder();
	}

	updateReminder() {
		if(this.hasChanges !== !isEqual(this.userSession, this.changes)) {
			this.reminderRef.current.toggleReminder();
			this.hasChanges = !isEqual(this.userSession, this.changes);
		}
	}

	reset() {
		this.recordChanges(this.userSession, false);
		this.passwordSectionRef.current.reset();
		this.nameSectionRef.current.reset();
	}

	submit() {
		if(!this.error) {
			changeUserData(
				this.changes,
				this.props.userSession.email,
				this.props.mutateUser
			)
			.catch(err => console.log(err));
			this.userSession = JSON.parse(JSON.stringify(this.changes));
			this.updateReminder();
			this.passwordSectionRef.current.reset();
		} else {
			console.log(this.error);
		}
	}

	render() {
		const { classes } = this.props;

		return(
			<Container className={classes.root} disableGutters>
				<NameSection
					id='name-section'
					ref={this.nameSectionRef}
					classes={classes}
					firstName={this.userSession.firstName}
					lastName={this.userSession.lastName}
					recordChanges={this.recordChanges}
				/>

				<Divider variant="middle" className={classes.divider}/>
				
				<PasswordSection
					id='password-section'
					ref={this.passwordSectionRef} 
					classes={classes}
					oldPassword={this.userSession.password}
					recordChanges={this.recordChanges}
				/>
				
				<Divider variant="middle" className={classes.divider}/>
				
				<StickyReminder 
					ref={this.reminderRef}
					collapsible={false}
					message='You have unsaved changes'
					stickyPosition='bottom'
					visible={false}
				>
					<Button
						aria-label='reset form'
						color="inherit"
						size="small"
						onClick={this.reset}
					>
						Reset
					</Button>
					<Button
						aria-label='save changes'
						color="inherit"
						size="small"
						onClick={this.submit}
					>
						Save
					</Button>
				</StickyReminder>
			</Container>
		);
	}
 }

const mapStateToProps = (state) => ({
	userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
    mutateUser: (userProps) => dispatch(userAction(
        'default',
        userProps
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
	withStyles(styles)(withRouter(AccountSetting))
);