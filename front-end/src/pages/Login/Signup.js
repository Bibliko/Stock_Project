import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import { shouldRedirectToLandingPage, redirectToPage } from '../../utils/PageRedirectUtil';
import { signupUser } from '../../utils/UserUtil';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import NormalTextField from '../../components/TextField/normalTextField';
import PasswordTextField from '../../components/TextField/passwordTextField';
import { Container } from '@material-ui/core';

const styles = theme => ({
    root: {
        position: 'absolute',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'none',
        minHeight: '570px'
    },
    paper: {
        height: '550px',
        width: 'fit-content',
        minWidth: '450px',
        [theme.breakpoints.down('xs')]: {
            height: '-webkit-fill-available',
            width: '-webkit-fill-available',
            minWidth: 0,
        },
        padding: theme.spacing(1),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.gradientPaper.main,
    },
    div: {
        background: 'black',
        backgroundSize: 'cover',
        height: '100vh',
        width: '100vw',
        position: 'fixed'
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
        fontWeight: 'bold'
    },
    avatar: {
        height: '130px',
        width: '130px',
        margin: theme.spacing(3)
    },
    submit: {
        marginTop: '10px',
        padding: theme.spacing(1),
        height: '40px',
        width: '120px',
        background: 'black',
        '&:hover': {
            backgroundColor: 'black',
            opacity: 0.8
        },
        borderRadius: '40px',
        color: 'white',
        fontWeight: 'bold'
    },
    link: {
        marginTop: '6px',
        backgroundColor: 'transparent',
        color: 'black',
        fontWeight: 'bold',
        textTransform: 'none',
        fontSize: '16px'
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

class Signup extends React.Component {
    state = {
        error: "",
        success: "",
    }

    errorTypes = [
        "Confirm Password does not match Password.",
        "Missing some fields"
    ]
    
    email=""
    password=""
    confirmPassword=""

    setStateErrorPassword = () => {
        if(!_.isEqual(this.password, this.confirmPassword)) {

            if(!_.isEqual(this.state.error, this.errorTypes[0])) {
                this.setState({ error: this.errorTypes[0] });
            }
        }
        else {
            if(!_.isEmpty(this.state.error)) {
                this.setState({ error: "" });
            }
        }
    }

    changeEmail = (event) => {
        this.email = event.target.value;
        if(
            _.isEqual(this.password, this.confirmPassword) &&
            !_.isEmpty(this.state.error)
        ) {
            this.setState({ error: "" });
        }
    }

    changePassword = (event) => {
        this.password = event.target.value;
        this.setStateErrorPassword();
    }

    changeConfirmPassword = (event) => {
        this.confirmPassword=event.target.value;
        this.setStateErrorPassword();
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
            if(_.isEmpty(this.state.error)) {
                signupUser({
                    email: this.email,
                    password: this.password
                })
                .then(res => {
                    this.setState({ success: res });
                })
                .catch(err => {
                    this.setState({ error: err });
                })
            }
        }
    }

    handleKeyDown = (event) => {
        if(event.key==="Enter") {
            this.submit();
        }
    }
    
    componentDidMount() {
        if(shouldRedirectToLandingPage(this.props)) {
            redirectToPage('/', this.props);
        }
    }

    componentDidUpdate() {
        if(shouldRedirectToLandingPage(this.props)) {
            redirectToPage('/', this.props);
        }
    }

    render() {
        const { classes } = this.props;

        if (shouldRedirectToLandingPage(this.props)) {
            return null;
        }

        return (
            <div>
                <div className={classes.div}/>
                <Container className={classes.root} disableGutters>
                    <Paper 
                        className={classes.paper}
                        elevation={2}
                    >
                        <Grid container spacing={1} direction="column"
                            className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <img 
                                    src="/bibOfficial.jpg"
                                    alt="Bibliko"
                                    className={classes.avatar}
                                />
                            </Grid>
                            <Grid 
                                container spacing={2} direction="column"
                                item xs className={classes.center}
                            >
                                <Grid item xs className={classes.center}>
                                    <NormalTextField
                                        name= 'Email'
                                        changeData={this.changeEmail}
                                        enterData={this.handleKeyDown}
                                    />
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <PasswordTextField 
                                        name='Password'
                                        changePassword={this.changePassword}
                                        enterPassword={this.handleKeyDown}
                                    />
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <PasswordTextField
                                        name='Confirm Password'
                                        changePassword={this.changeConfirmPassword}
                                        enterPassword={this.handleKeyDown}
                                    />
                                </Grid>
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
                                <Grid item xs className={classes.center}>
                                    <Button className={classes.submit}
                                        onClick={this.submit}
                                    >
                                        Sign Up
                                    </Button>
                                    <Button 
                                        color="primary"
                                        onClick={() => {redirectToPage("/login", this.props)}}
                                        className={classes.link}
                                    >
                                        Back to Login
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userSession: state.userSession
});

export default connect(mapStateToProps)(
    withStyles(styles)(withRouter(Signup))
);