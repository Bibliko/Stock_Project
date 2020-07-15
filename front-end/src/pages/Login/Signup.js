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
import MenuItem from '@material-ui/core/MenuItem';
//import Select from '@material-ui/core/Select';
//import MobileStepper from '@material-ui/core/MobileStepper';
//import FormControl from '@material-ui/core/FormControl';
//import InputLabel from '@material-ui/core/InputLabel';

const styles = theme => ({
    root: {
        position: 'absolute',
        height: '100vh',//'-webkit-fill-available
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'none',
        minHeight: '660px'
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
        width: 110,
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

const occupations = [
    {
      value: 'Student',
      label: 'Student',
    },
    {
      value: 'Teacher',
      label: 'Teacher',
    },
    {
      value: 'Others',
      label: 'Others',
    },
];

const regions = [
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
        value: 'Others',
        label: 'Others',
    },
];

class Signup extends React.Component {
    state = {
        error: "",
        success: "",
        occupation: "",
        region:"",
    }

    errorTypes = [
        "Confirm Password does not match Password.",
        "Missing some fields"
    ]
    
    email=""
    password=""
    confirmPassword=""
    firstname=""
    lastname=""

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

    changeFirstName = (event) => {
        this.firstname = event.target.value;
        if(!_.isEmpty(this.state.error)) {
            this.setState({ error: "" });
        }
    }

    changeLastName = (event) => {
        this.lastname = event.target.value;
        if(!_.isEmpty(this.state.error)) {
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

    changeOccupation = (event) => {
        console.log(event.target.value);
        this.setState({ occupation: event.target.value });
    }

    changeRegion = (event) => {
        this.setState({ region: event.target.value });
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
            <div>
                <div className={classes.div}/>
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
                                        label='First Name'
                                        variant= 'filled'
                                        fullWidth
                                        className= {classes.textField}
                                        InputProps={{
                                            className: classes.input
                                        }}
                                        onChange={this.changeFirstName}
                                        onKeyDown={this.handleKeyDown}
                                    />
                                    <TextField
                                        name= 'Last Name'
                                        id='lname'
                                        label='Last Name'
                                        variant= 'filled'
                                        fullWidth
                                        className= {classes.textField}
                                        InputProps={{
                                            className: classes.input
                                        }}
                                        onChange={this.changeLastName}
                                        onKeyDown={this.handleKeyDown}
                                    />
                                </Grid>
                                <Grid item xs className={classes.center}>
                                    <TextField
                                        select
                                        id="Occupation"
                                        label="OCC"
                                        variant="filled"
                                        SelectProps={{
                                            className: classes.input,
                                        }}
                                        className={classes.textField}
                                        value={this.state.occupation}
                                        onChange={this.changeOccupation}
                                    >
                                        {occupations.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        id="Region"
                                        label="Region"
                                        variant="filled"
                                        SelectProps={{
                                            className: classes.input,
                                        }}
                                        className={classes.textField}
                                        value={this.state.region}
                                        onChange={this.changeRegion}
                                    >
                                        {regions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
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
                                        name='Confirm Passsword'
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