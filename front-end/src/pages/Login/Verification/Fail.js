import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import FunctionsProvider from '../../../provider/FunctionsProvider';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import HighlightOffIcon from '@material-ui/icons/HighlightOff';

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
        flexBasis: 'unset'
    },
    title: {
        fontSize: 'large',
        color: theme.palette.fail.main
    },
    avatar: {
        height: "130px",
        width: "130px", 
        marginBottom: '10px'
    },
    failIcon: {
        height: "100px",
        width: "100px",
        color: theme.palette.fail.main
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
    backToLoginText: {
        fontSize: '15px',
        fontWeight: '600'
    },
});

class Fail extends React.Component {
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
                            <HighlightOffIcon className={classes.failIcon}/>
                            <Typography 
                                color="error"
                                className={classes.title}
                            >
                                Email Verified Failed
                            </Typography>
                        </Grid>
                        <Grid 
                            item xs className={classes.center}
                        >
                            <Button 
                                classes={{
                                    root: classes.backToLoginText
                                }}
                                onClick={() => {
                                    this.redirect("/login")
                                }}
                            >
                                Back To Login
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

Fail.contextType = FunctionsProvider.context;

const mapStateToProps = (state) => ({
    userSession: state.userSession
});

export default connect(mapStateToProps)(
    withStyles(styles)(withRouter(Fail))
);