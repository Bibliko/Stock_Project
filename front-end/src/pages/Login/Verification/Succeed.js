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

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const styles = theme => ({
    root: {
        position: 'absolute',
        height: '-webkit-fill-available',
        width: '-webkit-fill-available',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
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
        marginTop: '30px',
        marginBottom: '30px',
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
            <div className={classes.root}>
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