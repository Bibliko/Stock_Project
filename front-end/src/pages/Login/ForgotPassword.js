import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import FunctionsProvider from '../../provider/FunctionsProvider';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        position: 'absolute',
        height: '-webkit-fill-available',
        width: '-webkit-fill-available',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        position: 'absolute',
        height: 500,
        width: 450,
        padding: theme.spacing(1),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flexBasis: 'unset'
    },
    title: {
        fontSize: 'x-large',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submit: {
        marginTop: '16px',
        padding: theme.spacing(1),
        minHeight: '40px',
        background: theme.palette.barButton.main,
        '&:hover': {
            opacity: 0.85
        },
        fontWeight: 'bold'
    },
    link: {
        fontWeight: 'bold',
        fontSize: 'small'
    },
    announcement: {
        marginTop: 5,
        display: 'flex',
        justifyContent: 'center',
    },
    announcementText: {
        fontSize: 'small'
    },
});

class ForgotPassword extends React.Component {
    state = {
        error: "",
        success: "",
        allowButtonSendCode: true,
        allowCode: false,
        allowPassword: false
    }

    errorTypes = [
        "Confirm Password does not match Password.",
        "Missing some fields"
    ]

    email=""
    code=""
    password=""
    confirmPassword=""

    changeEmail = (event) => {
        this.email = event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }
    changeCode = (event) => {
        this.code = event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }
    changePassword = (event) => {
        this.password=event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }
    changeConfirmPassword = (event) => {
        this.confirmPassword=event.target.value;

        if(!_.isEqual(this.password, this.confirmPassword)) {

            if(!_.isEqual(this.state.error, this.errorTypes[0])) {
                this.setState({ error: this.errorTypes[0] });
            }

        }
        else {
            this.setState({ error: "" });
        }
    }

    sendCode = () => {
        if(_.isEmpty(this.email)) {
            this.setState({
                error: this.errorTypes[1],
            })
        }
        else {
            this.context.sendPasswordVerificationCode(this.email)
            .then(res => {
                this.setState({ 
                    success: res,
                    error: "",
                    allowCode: true
                });
            })  
            .catch(err => {
                this.setState({ error: err });
            })
        }
    }

    verifyCode = () => {
        this.setState({ success: "" });
        if(_.isEmpty(this.code)) {
            this.setState({
                error: this.errorTypes[1],
            });
        }
        else {
            this.context.checkVerificationCode(this.code)
            .then(() => {
                this.setState({ 
                    allowButtonSendCode: false,
                    allowCode: false,
                    allowPassword: true
                });
            })
            .catch(err => {
                this.setState({
                    error: err,
                });
            })
        }
    }

    submit = () => {
        if(
            _.isEmpty(this.email) ||
            _.isEmpty(this.password) ||
            _.isEmpty(this.confirmPassword)
        ) {
            this.setState({ error: this.errorTypes[1] }); 
        }
        else {
            this.context.changePassword(this.password, this.email)
            .then(res => {
                this.setState({ success: res });
            })
            .catch(err => {
                this.setState({ error: err });
            })
        }
    }

    enterEmail = (event) => {
        if(event.key==="Enter") {
            this.sendCode();
        }
    }

    enterCode = (event) => {
        if(event.key==="Enter") {
            this.verifyCode();
        }
    }

    enterPassword = (event) => {
        if(event.key==="Enter") {
            this.submit();
        }
    }

    redirect = (link) => {
        const { history } = this.props;
        history.push(link);
    }
    
    componentCheck = () => {
        if(!_.isEmpty(this.props.userSession)) {
            this.redirect('/');
        }
      }
    
    componentDidMount() {
        this.componentCheck();
    }

    componentDidUpdate() {
        this.componentCheck();
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Paper 
                    className={classes.paper}
                    variant="outlined"
                    elevation={2}
                >
                    <Grid container spacing={2} direction="column"
                        className={classes.center}
                    >
                        <Grid item xs>
                            <Typography className={classes.title}>
                                Change Password
                            </Typography>
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Email"
                                    label="Email"
                                    onChange={this.changeEmail}
                                    onKeyDown={this.enterEmail}
                                />
                            </Grid>
                            {
                                this.state.allowButtonSendCode &&
                                <Grid item xs className={classes.center}>
                                    <Button color="primary" variant="outlined"
                                        onClick={this.sendCode}
                                    >
                                        Send Code
                                    </Button>
                                </Grid>
                            }
                            {
                                this.state.allowCode &&
                                <Grid item xs className={classes.center}>
                                    <TextField 
                                        id="Code"
                                        label="Code"
                                        onChange={this.changeCode}
                                        onKeyDown={this.enterCode}
                                    />
                                </Grid>
                            }
                            {
                                this.state.allowCode &&
                                <Grid item xs className={classes.center}>
                                    <Button color="primary" variant="outlined"
                                        onClick={this.verifyCode}
                                    >
                                        Next
                                    </Button>
                                </Grid>
                            }
                            {   
                                this.state.allowPassword &&
                                <div>
                                    <Grid item xs className={classes.center}>
                                        <TextField 
                                            id="Password"
                                            label="Password"
                                            type="password"
                                            onChange={this.changePassword}
                                            onKeyDown={this.enterPassword}
                                        />
                                    </Grid>
                                    <Grid item xs className={classes.center}>
                                        <TextField 
                                            id="Confirm Password"
                                            label="Confirm Password"
                                            type="password"
                                            onChange={this.changeConfirmPassword}
                                            onKeyDown={this.enterPassword}
                                        />
                                    </Grid>
                                    <Grid item xs className={classes.center}>
                                        <Button className={classes.submit}
                                            onClick={this.submit}
                                        >
                                            Submit
                                        </Button>
                                    </Grid>
                                </div>
                            }
                            {
                                !_.isEmpty(this.state.error) &&
                                <Grid item xs className={classes.announcement}>
                                    <Typography color="error" align="center"
                                        className={classes.announcementText}
                                    >
                                        Error: {this.state.error}
                                    </Typography>
                                </Grid>
                            }
                            {
                                !_.isEmpty(this.state.success) &&
                                <Grid item xs className={classes.announcement}>
                                    <Typography color="primary" align="center"
                                        className={classes.announcementText}
                                    >
                                        Success: {this.state.success}
                                    </Typography>
                                </Grid>
                            }
                        </Grid>
                        <Grid item xs className={classes.center}>
                            <Button color="primary" onClick={() => {this.redirect("/login")}}
                                className={classes.link}
                            >
                                Log In
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

ForgotPassword.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
    userSession: state.userSession
});

export default connect(mapStateToProps)(
    withStyles(styles)(withRouter(ForgotPassword))
);