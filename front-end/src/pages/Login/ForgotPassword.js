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
        backgroundColor: "#000000"
    },
    paper: {
        position: 'absolute',
        height: 'fit-content',
        width: 450,
        [theme.breakpoints.down('xs')]: {
            height: '100%',
            width: '100%'
        },
        padding: theme.spacing(1),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.gradientPaper.main,
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flexBasis: 'unset',
        flexGrow: 0
    },
    instruction: {
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        borderRadius: '50%',
        height: "40px",
        width: "40px" 
    },
    avatar: {
        height: "130px",
        width: "130px", 
        marginBottom: "10px",
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
    announcementText: {
        fontSize: 'small'
    },
    orLogInWith: {
        fontWeight: 'lighter',
        color: theme.palette.subText.main,
    },
    alternativeLoginButton: {
        maxHeight: 'fit-content',
        maxWidth: 'fit-content',
        padding: 0,
        minWidth: 0,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: '50%'
    },
    backToLoginText: {
        fontSize: '15px',
        fontWeight: '600'
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
        const { loginUser } = this.context;

        return (
            <div className={classes.root}>
                <Paper 
                    className={classes.paper}
                    elevation={2}
                >
                    <Grid container spacing={2} direction="column"
                        className={classes.center}
                    >
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <img 
                                className={classes.avatar}
                                src="/bib.png"
                                alt="Bibliko"
                            />
                            <Typography className={classes.instruction}>
                                Please enter your email and we’ll send you a code.
                            </Typography>
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
                                        Send
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
                                <Grid item xs className={classes.center}>
                                    <Typography color="error" align="center"
                                        className={classes.announcementText}
                                    >
                                        Error: {this.state.error}
                                    </Typography>
                                </Grid>
                            }
                            {
                                !_.isEmpty(this.state.success) &&
                                <Grid item xs className={classes.center}>
                                    <Typography color="primary" align="center"
                                        className={classes.announcementText}
                                    >
                                        Success: {this.state.success}
                                    </Typography>
                                </Grid>
                            }
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <Button 
                                    classes={{
                                        root: classes.backToLoginText
                                    }}
                                    onClick={() => {
                                        this.redirect("/login")
                                    }}
                                >
                                    Login
                                </Button>
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <Typography className={classes.orLogInWith}>
                                    or login with
                                </Typography>
                            </Grid>
                            <Grid item xs
                                className={classes.center}
                            >
                                <Button //Google icon swap with Facebook icon
                                    onClick={() => { 
                                        loginUser("google") 
                                    }}
                                    classes={{
                                        root: classes.alternativeLoginButton
                                    }}
                                >
                                    <img 
                                        src="/google-logo-png-open-2000.png"//change the logo to fit with the background
                                        alt="google"
                                        className={classes.image}
                                    />
                                </Button>
                                <Button 
                                    onClick={() => {
                                        loginUser("facebook")
                                    }}
                                    classes={{
                                        root: classes.alternativeLoginButton
                                    }}
                                >
                                    <img 
                                        src="/facebook.png"
                                        alt="facebook"
                                        className={classes.image}
                                    />
                                </Button> 
                            </Grid>
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