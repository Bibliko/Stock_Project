import React from 'react';
//import _ from 'lodash';
import clsx from 'clsx';
import { withRouter } from 'react-router';

import { connect } from 'react-redux';
import {
   userAction,
} from '../../redux/storeActions/actions';
import { socket } from '../../App';

import { updateUserDataForSocket } from '../../utils/SocketUtil';

import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Typography} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
//import NormalTextField from '../../components/TextField/normalTextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
//import Paper from '@material-ui/core/Paper';
const styles = theme => ({
    root: {
        position: 'absolute',
        height: '100%',
        width: '75%',
        [theme.breakpoints.down('xs')]: {
            width: '85%',
        },
        background: 'rgba(0,0,0,0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'none',
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flexBasis: 'unset',
    },
    fullHeightWidth: {
        height: '100%',
        width: '100%'
    },
    itemGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
        minHeight: '125px',
        //maxHeight: '300px'
    },
    gridTitle: {
        fontSize: 'x-large',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'large'
        },
        fontWeight: 'bold',
        marginTop: '10px'
    },
    TitleLabel: {
        color: '#FF3747'
    },
    statistic: {
        color: '#74E0EF'
    },
    textField: {
        height: 50,
        width: 300,
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
    select: {
        color:'black',
        backgroundColor: 'rgba(225,225,225,0.95)', 
        "&:hover": {
            backgroundColor: 'rgba(225,225,225,0.75)', 
        },
        "& input": {
            backgroundColor: 'rgba(225,225,225,0)'
        }
    },
    table: {
        color:'blue',
        backgroundColor: '#74E0EF',
        width: 550,
    }
});
const levels = [
    {
        value: 'Overall',
        label: 'Overall Ranking',   
    },
    {
        value: '',
        label: 'None',
    }
]

function createData(name) {
    return { name };
  }

const rows = [
    createData('Overall ranking:'),
    createData('Region ranking'),
    createData('Portfolio value'),
    createData('Change from previous week'),
    createData('Portfolio high'),
    createData('Portfolio low'),
    createData('Overall rank syndicates'),
    createData('Average syndicate value'),
    createData('% of syndicates in profit')
];

class Ranking extends React.Component {
    componentDidMount() {
        console.log(this.props.userSession);
    }

    componentDidUpdate() {
        updateUserDataForSocket(socket, this.props.userSession);
    }

    render() {
        const { classes } = this.props;

        return (
            <Container className={classes.root} disableGutters>
                <Grid container spacing={6} direction="row"
                    className={classes.fullHeightWidth}
                >
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle,classes.TitleLabel)}>
                            Choose a Ranking level:
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <TextField
                            className={classes.textField}
                            id='ranking'
                            select
                            label='Ranking level'
                            //value
                            //onChange
                            variant='filled'
                            SelectProps={{
                                className: classes.select,
                            }}
                        >
                            {levels.map((option) => (
                                <MenuItem key= {option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle,classes.TitleLabel)}>
                            Overall Ranking
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                        <Typography className={clsx(classes.gridTitle,classes.statistic)}>
                            My stats
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.itemGrid}>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.center}>
                            <Table className={classes.table} >
                                <TableHead>
                                <TableRow>
                                    <TableCell>Performance summary</TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.name}>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="right">{row.calories}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    userSession: state.userSession,
});

const mapDispatchToProps = (dispatch) => ({
    mutateUser: (userProps) => dispatch(userAction(
        'default',
        userProps
    )),
});

export default connect(mapStateToProps,mapDispatchToProps)(
    withStyles(styles)(withRouter(Ranking))
);