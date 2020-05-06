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
    image: {
        borderRadius: '50%',
        height: "50px",
        width: "50px" 
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
    orLogInWith: {
        color: theme.palette.subText.main,
        fontSize: 'small',
        marginTop: theme.spacing(1)
    },
});

class Login extends React.Component {
    
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
        const { loginUser } = this.context;

        return (
            <div className={classes.root}>
                <Paper 
                    className={classes.paper}
                    variant="outlined"
                    elevation={2}
                >
                    <Grid container spacing={2} direction="column">
                        <Grid item xs className={classes.center}>
                            <Typography className={classes.title}>
                                Log In
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
                                />
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <TextField 
                                    id="Password"
                                    label="Password"
                                />
                            </Grid>
                            <Grid item xs className={classes.center}>
                                <Button className={classes.submit}>
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid 
                            container spacing={1} direction="column"
                            item xs className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <Typography className={classes.orLogInWith}>
                                    Or Log In with:
                                </Typography>
                            </Grid>
                            <Grid item xs
                                className={classes.center}
                            >
                                <Button 
                                    onClick={() => {loginUser("facebook")}}
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

Login.contextType = UserProvider.context;

export default withStyles(styles)(withRouter(Login));