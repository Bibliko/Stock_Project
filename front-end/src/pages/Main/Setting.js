import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import { connect } from 'react-redux';

import SettingNormalTextField from './SettingNormalTextField';
import SettingPasswordTextField from './SettingPasswordTextField';

import { withStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

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
    render() {
        const { classes } = this.props;
        return(
            <div id='PasswordWrapper' className={classes.passwordSection}>
                <Grid container spacing={2} direction="row" className={classes.fullHeightWidth}>
                    <Grid item xs={12} className={classes.itemGrid}>
                        <SettingPasswordTextField name='Old Password' invalid={true} helper='Incorrect password'/>
                    </Grid>                
                    <Grid item xs={12} className={classes.itemGrid}>
                        <SettingPasswordTextField name='New Password'/>
                    </Grid>
                    <Grid item xs={12} className={classes.itemGrid}>
                        <SettingPasswordTextField name='Retype Password' invalid={true} helper="Password doesn't match"/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

class AccountSetting extends React.Component {
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
                <PasswordSection classes={classes}/>
                <Divider variant="middle" />
            </Container>
        );
    }
  }

const mapStateToProps = (state) => ({
    userSession: state.userSession,
    hasUnsaveSetting: state.hasUnsaveSettings,
    unsaveSettings: state.unsaveSettings,
});
  
const mapDispatchToProps = (dispatch) => ({
    recordChangedSettings: (userProps) => dispatch(userAction(
        'changeSettings'
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(AccountSetting))
);