import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import { connect } from 'react-redux';

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
		height: '100%',
		width: '75%',
		[theme.breakpoints.down('xs')]: {
			width: '85%',
		},
		background: 'rgba(0,0,0,0)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		maxWidth: 'none',
	},
	nameSection: {
		marginBottom: '40px',
		marginTop: '33px',
		[theme.breakpoints.down('xs')]: {
			marginBottom: '30px',
			marginTop: '25px',
		},
	},
	passwordSection: {
		marginBottom: '40px',
		marginTop: '33px',
		[theme.breakpoints.down('xs')]: {
			marginBottom: '30px',
			marginTop: '25px',
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
});

class PasswordSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			wrongPassword: false
		}
		this.invalidPassword = false;
		this.unmatchedPassword = false;
		this.newPassword = '';
	}

	checkOldPassword(input) {
		this.setState({
			wrongPassword: this.password !== input.target.value
		});
	}

	recordNewPassword(input) {
		this.newPassword = input.target.value;
		if (this.newPassword.length < 8)
			this.invalidPassword = true
		this.unmatchedPassword = this.newPassword !== input.target.value;
		this.props.recordChanges(true, this.wrongPassword || this.invalidPassword || this.unmatchedPassword)
	}

	recordConfirmPassword(input) {
		this.unmatchedPassword = this.newPassword !== input.target.value;
		this.props.recordChanges(true, this.wrongPassword || this.invalidPassword || this.unmatchedPassword)   
	}

	render() {
		const { classes } = this.props;
		return(
			<div id='PasswordWrapper' className={classes.passwordSection}>
				<Grid container spacing={2} direction="row" className={classes.fullHeightWidth}>
					<Grid item xs={12} className={classes.itemGrid}>
						<SettingPasswordTextField
							name='Old Password'
							isInvalid={this.wrongPassword}
							helper='Incorrect password'
							onChange={this.checkOldPassword}
						/>
					</Grid>                
					<Grid item xs={12} className={classes.itemGrid}>
						<SettingPasswordTextField
							name='New Password'
							isInvalid={this.invalidPassword}
							helper='Password must contain at least 8 characters'
							onChange={this.recordNewPassword}
						/>
					</Grid>
					<Grid item xs={12} className={classes.itemGrid}>
						<SettingPasswordTextField 
							name='Retype Password'
							isInvalid={this.unmatchedPassword}
							helper="Password doesn't match"
							onChange={this.recordConfirmPassword}
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
		this.recordChanges = this.recordChanges.bind(this);
	}

	recordChanges(hasChanges, error) {
		this.hasChanges = hasChanges;
		error = error;
	}

	render() {
		const { classes, userSession } = this.props;
		return(
			<Container className={classes.root} disableGutters>
				<div className={classes.nameSection}>
					<Grid container spacing={1} direction="row" className={classes.fullHeightWidth}>
						<Grid item xs={6} className={classes.itemGrid}>
							<SettingNormalTextField name='First name' defaultValue={userSession.firstName}/>
						</Grid>                
						<Grid item xs={6} className={classes.itemGrid}>
							<SettingNormalTextField name='Last name' defaultValue={userSession.lastName}/>
						</Grid>
					</Grid>
				</div>
				<Divider variant="middle" />
				<PasswordSection classes={classes} oldPassword={userSession.password} recordChanges={this.recordChanges}/>
				<Divider variant="middle" />
				<StickyReminder 
					collapsible={false}
					message='You have unsaved changes'
					stickyPosition='bottom'
				>
					<Button color="inherit" size="small">
						Reset
					</Button>
					<Button color="inherit" size="small">
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

export default connect(mapStateToProps)(
	withStyles(styles)(withRouter(AccountSetting))
);