import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
    userAction,
} from '../../../redux/storeActions/actions';

import FunctionsProvider from '../../../provider/FunctionsProvider';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const styles = theme => ({
    root: {
        position: 'absolute',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'none',
        minHeight: '410px'
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
        backgroundColor: 'black',
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
        fontSize: 'large',
        color: theme.palette.succeed.main
    },
    avatar: {
        height: "130px",
        width: "130px", 
        marginBottom: '10px'
    },
    succeedIcon: {
        height: "100px",
        width: "100px",
        color: theme.palette.succeed.main
    },
    mainGridOfPaper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        marginTop: '10px',
        marginBottom: '20px',
        flexBasis: 'unset'
    },
});

class Succeed extends React.Component {
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
                            className={classes.mainGridOfPaper}
                        >
                            <Grid item xs className={classes.center}>
                                <img 
                                    src="/bib.png"
                                    alt="Bibliko"
                                    className={classes.avatar}
                                />
                            </Grid>
                            <Grid item xs className={classes.center} container direction="column">
                                <CheckCircleOutlineIcon className={classes.succeedIcon} />
                                <Typography className={classes.title}>
                                    Email Verified Successfully
                                </Typography>
                            </Grid>
                            <Grid item className={classes.center}>
                                <Typography>
                                    Redirecting to Home Page...
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </div>
        );
    }
}

Succeed.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
    userSession: state.userSession
});

const mapDispatchToProps = (dispatch) => ({
    mutateUser: (userProps) => dispatch(userAction(
        'default',
        userProps
    )),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(withRouter(Succeed))
);