import React from 'react';
import { withRouter } from 'react-router';

import UserProvider from '../../../contexts/UserProvider';

import Paper from '@material-ui/core/Paper';
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
        justifyContent: 'center'
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
        fontWeight: 'bold'
    },
});

class Succeed extends React.Component {
    redirect = (link) => {
        const { history } = this.props;
        history.push(link);
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
                                Verficiation Succeeds
                            </Typography>
                        </Grid>
                        <Grid 
                            item xs className={classes.center}
                        >
                            <Button 
                                color="primary" variant="outlined"
                                onClick={() => {
                                    this.redirect("/")
                                }}
                            >
                                Go Back To Home Page
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

Succeed.contextType = UserProvider.context;

export default withStyles(styles)(withRouter(Succeed));