import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router';
import { isUndefined } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const styles = theme => ({
    reminder: {
        position: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        width: '100%',
        height: '40px',
        padding: '10px',
        backgroundColor: '#e23d3d',
        zIndex: 10,
        top: '60px'
    },
    reminderText: {
        fontSize: 'small',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'x-small',
        },
    },
    reminderLink: {
        '&:hover': {
            cursor: 'pointer'
        },
        marginLeft: '5px',
        marginRight: '5px',
        color: 'white',
        textDecoration: 'underline'
    },
    hide: {
        display: 'none'
    }
});

const settingAccountComponent = (classes, preventDefault) => {
    return (
        <Typography className={classes.reminderText}>
            You haven't finished setting up your account. Go to 
            <Link 
                onClick={preventDefault}
                className={classes.reminderLink}
            >
                Account Settings 
            </Link>
            to finish up.
        </Typography>
    );
}

class Reminder extends React.Component {
    state = {
        hide: false
    }

    preventDefault = (event) => event.preventDefault();

    render() {
        const { 
            classes, 
            isUserFinishedSettingUpAccount,
        } = this.props; 

        return(
            <div className={clsx(classes.reminder, {
                [classes.hide]: isUserFinishedSettingUpAccount,
                [classes.hide]: this.state.hide
            })}>
                {
                    !isUndefined(isUserFinishedSettingUpAccount) && !isUserFinishedSettingUpAccount &&
                    settingAccountComponent(classes, this.preventDefault)
                }
            </div>
        );
    }
}

export default withStyles(styles)(withRouter(Reminder));
