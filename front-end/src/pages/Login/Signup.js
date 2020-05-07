import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';

import UserProvider from '../../contexts/UserProvider';

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
        width: '-webkit-fill-available'
    },
    paper: {
        position: 'absolute',
        height: 500,
        width: 450,
        left: 'calc((100% - 450px) / 2)',
        top: 'calc((100% - 500px) / 2)',
        padding: theme.spacing(3),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 'x-large',
        fontWeight: 'bold'
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
    error: {
        marginTop: 5,
        display: 'flex',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 'small'
    },
});

class Signup extends React.Component {
    state = {
        error: ""
    }

    errorTypes = [
        "Confirm Password does not match Password.",
        "Missing some fields"
    ]

    username=""
    password=""
    confirmPassword=""

    changeUsername = (event) => {
        this.username=event.target.value;
    }
    changePassword = (event) => {
        this.password=event.target.value;
    }
    changeConfirmPassword = (event) => {
        this.confirmPassword=event.target.value;

        if(!_.isEqual(this.password, this.confirmPassword)) {

            if(!_.isEqual(this.state.error, this.errorTypes[0]))
                this.setState({ error: this.errorTypes[0] });

        }
        else
            this.setState({ error: "" });
        
    }

    submit = () => {
        const { history } = this.props;

        if(
            _.isEmpty(this.username) ||
            _.isEmpty(this.password) ||
            _.isEmpty(this.confirmPassword)
        )
            this.setState({ error: this.errorTypes[1] }); 
        else {
            if(_.isEmpty(this.state.error)) 
                this.context.signupUser({
                    username: this.username,
                    password: this.password
                })
                .then(() => {
                    history.push('/');
                })
                .catch(err => {
                    this.setState({ error: err });
                })
        }
    }

    redirect = (link) => {
        const { history } = this.props;
        history.push(link);
    }
    
    componentCheck = () => {
        const { history } = this.props;
    
        this.context.getUser()
        .then(user => {
          if(!_.isEmpty(user.data))
            history.push('/');
        })
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
                        <Grid item xs className={classes.center}>
                            <Typography className={classes.title}>
                                Sign Up
                            </Typography>
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Username"
                                    label="Username"
                                    onChange={this.changeUsername}
                                />
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Password"
                                    label="Password"
                                    type="password"
                                    onChange={this.changePassword}
                                />
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Confirm Password"
                                    label="Confirm Password"
                                    type="password"
                                    onChange={this.changeConfirmPassword}
                                />
                            </Grid>
                            {
                                !_.isEmpty(this.state.error) &&
                                <Grid item xs className={classes.error}>
                                    <Typography color="error" align="center"
                                        className={classes.errorText}
                                    >
                                        Error: {this.state.error}
                                    </Typography>
                                </Grid>
                            }
                            <Grid item xs className={classes.center}>
                                <Button className={classes.submit}
                                    onClick={this.submit}
                                >
                                    Submit
                                </Button>
                            </Grid>
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

Signup.contextType = UserProvider.context;

export default withStyles(styles)(withRouter(Signup));