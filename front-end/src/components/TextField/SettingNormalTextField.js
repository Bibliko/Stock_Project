import React from "react";

import { withStyles } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";

import EditRoundedIcon from "@material-ui/icons/EditRounded";

const styles = theme => ({
  textFieldContainer: {
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
    }
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
    paddingLeft: '3%',
    fontWeight: "bold",
  },
});

class SettingNormalTextField extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          onHover: false
      };
      this.onMouseOver = this.onMouseOver.bind(this);
      this.onMouseOut = this.onMouseOut.bind(this);
  }

  onMouseOver () {
      this.setState({
          onHover: true
      });
  }

  onMouseOut () {
      this.setState({
          onHover: false
      });
  }

  render() {
    const { classes } = this.props;
    const { onHover } = this.state;

    return (
      <Container className={classes.textFieldContainer}>
          <Typography className={classes.title}>
              {this.props.name}
          </Typography>
        <TextField
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          id={this.props.name}
          name={this.props.name}
          variant="outlined"
          defaultValue={this.props.default}
          className={classes.textField}
          InputProps={{
            className: classes.input,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disabled
                  edge="start"
                >
                  {onHover && <EditRoundedIcon style={{margin:'-12px'}}/>}
                </IconButton>
              </InputAdornment>
            )
          }}
          onChange={this.props.changeData}
        />
      </Container>
      );
  }
}

export default withStyles(styles)(SettingNormalTextField);
