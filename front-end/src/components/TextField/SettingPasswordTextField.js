import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import EditRoundedIcon from '@material-ui/icons/EditRounded';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';


const styles = theme => ({
    textFieldContainer: {
        minWidth: '150px',
        marginLeft: '10px',
        marginRight: '10px',
    },
    textField: {
        width: '100%',
        marginTop: '5px',
        fontWeight: 'normal',
        '& label.Mui-focused': {
            color: 'black'
        },
        '& .MuiFilledInput-underline:after': {
            borderBottom: '2px solid #000000'
        },
        '& .MuiFilledInput-root': {
            '&.Mui-focused': {
                backgroundColor: 'rgba(225,225,225,0.5)'
            }
        },
    },
    input: {
        color: 'black',
        backgroundColor: 'rgba(225,225,225,0.6)',
        '&:hover': {
            backgroundColor: 'rgba(225,225,225,0.8)'
        },
        '& input': {
            backgroundColor: 'rgba(225,225,225,0)'
        },
        fontSize: '18px',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'small',
            height: '40px'
        },
    },
    title: {
        color: 'white',
        fontSize: '20px',
        [theme.breakpoints.down('xs')]: {
            fontSize: '15px'
        },
        paddingLeft: '5px',
        fontWeight: 'bold',
    },
});

class SettingPasswordTextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onHover: false,
            visibility: false,
            isInvalid: this.props.isInvalid,
            text: this.props.value,
        };
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isInvalid: nextProps.isInvalid,
            text: nextProps.value,
        });
    }

    onMouseOver() {
        this.setState({
            onHover: true
        });
    }

    onMouseOut() {
        this.setState({
            onHover: false
        });
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
        const { classes, name, helper, onChange } = this.props;
        const { onHover, visibility, isInvalid, text } = this.state;

        return (
            <Container className={classes.textFieldContainer}>
                <Typography className={classes.title}>
                    {name}
                </Typography>
                <TextField
                    fullWidth
                    value={text}
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.onMouseOut}
                    id={name}
                    name={name}
                    variant='outlined'
                    type={!visibility? 'password':'text'}
                    error={isInvalid}
                    helperText={isInvalid && helper}
                    className={classes.textField}
                    InputProps={{
                        className: classes.input,
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton
                                    disabled
                                    edge='start'
                                >
                                    {onHover && <EditRoundedIcon style={{margin:'-15px'}}/>}
                                </IconButton>
                                <IconButton
                                    aria-label='toggle password visibility'
                                    onClick={this.seePassword}
                                    onMouseDown={this.mouseDownPassword}
                                    edge='end'
                                >
                                    {visibility? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                          </InputAdornment>
                        )
                    }}
                    onChange={onChange}
                />
            </Container>
          );
    }
}

export default withStyles(styles)(SettingPasswordTextField);
