import React from 'react';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const styles = theme => ({
    textField: {
        height: 50,  
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
    },
});

/**
 * props required:
 * name
 * function changePassword
 * function enterPassword
 */

class PasswordTextField extends React.Component {
    state={
        visibility: false,
    }

    seePassword = () => {
        this.setState({
            visibility: !this.state.visibility
        })
    }

    mouseDownPassword = (event) => {
        event.preventDefault();
    }

    render() {
        const { classes } = this.props;

        return(
            <TextField 
                id={this.props.name}
                name={this.props.name}
                label={this.props.name}
                type={!this.state.visibility? "password":"text"}
                variant="filled"
                margin="normal"
                required
                className={classes.textField}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={this.seePassword}
                                onMouseDown={this.mouseDownPassword}
                                edge="end"
                            >
                                {!this.state.visibility? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    ),
                    className: classes.input,
                }}
                onChange={this.props.changePassword}
                onKeyDown={this.props.enterPassword}
            />
        );
    }
}

export default withStyles(styles)(PasswordTextField);
