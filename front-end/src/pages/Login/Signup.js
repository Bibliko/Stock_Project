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
import NormalTextField from '../../components/TextField/normalTextField';
import PasswordTextField from '../../components/TextField/passwordTextField';
import { Container } from '@material-ui/core';
//import Container from '@material-ui/core/Container';
import MenuItem from '@material-ui/core/MenuItem';
import NativeSelect from '@material-ui/core/NativeSelect';


const styles = theme => ({
    root: {
        position: 'absolute',
        height: '100vh',//'-webkit-fill-available
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'none',
        minHeight: '605px'

    },
    paper: {
        height: 'fit-content',
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
        height: '120px',
        width: '120px',
        margin: theme.spacing(1)
    },
    submit: {
        marginTop: '4px',
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
        backgroundColor: 'transparent',
        color: 'black',
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
    textField: {
        height: 50,
        width: 132,
        margin: '8px',
        fontWeight: 'normal',
        "& label.Mui-focused": {
            color: "black"
        },
        '& .MuiFilledInput-underline:after': {
            borderBottom: '2px solid #000000',
        },
        '& .MuiFilledInput-root': {
            '&.Mui-focused': {
                backgroundColor: 'rgba(225,225,225,0.5)'
            },
        },
    },
    input: {
        color:'black',
        backgroundColor: 'rgba(225,225,225,0.65)', 
        "&:hover": {
            backgroundColor: 'rgba(225,225,225,0.5)', 
        },
        "& input": {
            backgroundColor: 'rgba(225,225,225,0)'
        }
    },
});

const Occupation = [
    {
      value: 'Student',
      label: 'Student',
    },
    {
      value: 'Teacher',
      label: 'Teacher',
    },
    {
      value: 'others',
      label: 'Others',
    },
];

const Regions = [
    {
        value: 'Africa',
        label: 'Africa',
    },
    {
        value: 'Asia',
        label: 'Asia',
    },
    {
        value: 'Eur',
        label: 'Europe',
    },
    {
        value: 'NAmerica',
        label: 'North America',
    },
    {
        value: 'CAmerica',
        label: 'Central America',
    },
    {
        value: 'Oceania',
        label: 'Oceania',
    },
    {
        value: 'Oceania',
        label: 'Oceania',
    },
    {
        value: 'others',
        label: 'Others',
    },
];
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

    changeEmail = (event) => {
        this.email = event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }

    changePassword = (event) => {
        this.password = event.target.value;
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
                this.context.signupUser({
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
            <div className={classes.div}>
                <Container className={classes.root} disableGutters>
                    <Paper 
                        className={classes.paper}
                        elevation={2}
                    >
                        <Grid container spacing={2} direction="column"
                            className={classes.center}
                        >
                            <Grid item xs className={classes.center}>
                                <img 
                                    src="/bib.png"
                                    alt="Bibliko"
                                    className={classes.avatar}
                                />
                            </Grid>
                            <Grid 
                                container spacing={1} direction="column"
                                item xs className={classes.center}
                            >
                                <Grid item xs className={classes.center}>
                                    <TextField
                                        name= 'First Name'
                                        id='fname'
                                        label='First name'
                                        variant= 'filled'
                                        className= {classes.textField}
                                        InputProps={{
                                            className: classes.input
                                        }}

                                    />
                                    <TextField
                                        name= 'Last Name'
                                        id='fname'
                                        label='Last name'
                                        variant= 'filled'
                                        className= {classes.textField}
                                        InputProps={{
                                            className: classes.input
                                        }}
                                    />
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <TextField
                                        id="filled-select-occupation"
                                        select
                                        label="Occupation"
                                        value={Occupation}
                                        
                                        //onChange={handleChange}
                                        onKeyDown={this.handleKeyDown}
                                        variant="filled"
                                        SelectProps={{
                                            className: classes.input
                                        }}
                                        className={classes.textField}
                                        >
                                        {Occupation.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                        </MenuItem>
                                    ))}
                                    </TextField>
                                    <TextField
                                        id="filled-select-occupation"
                                        select
                                        label="Regions"
                                        value={Regions}
                                        //onChange={handleChange}
                                        variant="filled"
                                        SelectProps={{
                                            //native: true,
                                            className: classes.input
                                        }}
                                        className={classes.textField}
                                        >
                                        {Regions.map((option) => (
                                        <MenuItem value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <NormalTextField
                                        name= 'Email'
                                        onChange={this.changeEmail}
                                        onKeyDown={this.handleKeyDown}
                                    />
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <PasswordTextField 
                                        name= 'Password'
                                        onChange={this.changePassword}
                                        onKeyDown={this.handleKeyDown}
                                    />
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <PasswordTextField
                                        name= 'Confirm Passsword'
                                        onChange={this.changeConfirmPassword}
                                        onKeyDown={this.handleKeyDown}
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
                                    <Button color="primary" onClick={() => {this.redirect("/login")}}
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

Signup.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
    userSession: state.userSession
});

export default connect(mapStateToProps)(
    withStyles(styles)(withRouter(Signup))
);