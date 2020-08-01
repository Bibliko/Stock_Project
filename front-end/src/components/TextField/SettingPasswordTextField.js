import React from "react";

import { withStyles } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";

import EditRoundedIcon from "@material-ui/icons/EditRounded";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';


const styles = theme => ({
    textFieldContainer: {
        minWidth: '150px',
        marginLeft: "1.75%",
        marginRight: "1.75%",
    },
    textField: {
        width: '100%',
        marginTop: "5px",
        fontWeight: "normal",
        "& label.Mui-focused": {
            color: "black"
        },
        "& .MuiFilledInput-underline:after": {
            borderBottom: "2px solid #000000"
        },
        "& .MuiFilledInput-root": {
            "&.Mui-focused": {
                backgroundColor: "rgba(225,225,225,0.5)"
            }
        },
    },
    input: {
        color: "black",
        backgroundColor: "rgba(225,225,225,0.65)",
        "&:hover": {
            backgroundColor: "rgba(225,225,225,0.5)"
        },
        "& input": {
            backgroundColor: "rgba(225,225,225,0)"
        },
        fontSize: 'medium',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'small',
            height: '40px'
        },
    },
    title: {
        fontSize: '20px',
        [theme.breakpoints.down('xs')]: {
            fontSize: '15px'
        },
        paddingLeft: '5px',
        fontWeight: "bold",
    },
});

class SettingNormalTextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onHover: false,
            visibility: false,
            isInvalid: false,
        };
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
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
        const { classes, name, isInvalid, helper, changeData } = this.props;
        const { onHover, visibility } = this.state;

        return (
            <Container className={classes.textFieldContainer}>
                <Typography className={classes.title}>
                    {name}
                </Typography>
                <TextField
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.onMouseOut}
                    id={name}
                    name={name}
                    variant="outlined"
                    type={!visibility? "password":"text"}
                    error={isInvalid}
                    helperText={isInvalid && helper}
                    className={classes.textField}
                    InputProps={{
                        className: classes.input,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    disabled
                                    edge="start"
                                >
                                    {onHover && <EditRoundedIcon style={{margin:'-10px'}}/>}
                                </IconButton>
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={this.seePassword}
                                    onMouseDown={this.mouseDownPassword}
                                    edge="end"
                                >
                                    {visibility? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                          </InputAdornment>
                        )
                    }}
                    onChange={changeData}
                />
            </Container>
          );
    }
}

export default withStyles(styles)(SettingNormalTextField);
