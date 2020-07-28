import React from 'react';
import Chart from 'react-apexcharts';
import { isEqual, isEmpty } from 'lodash';
import { withRouter } from 'react-router';

import { connect } from 'react-redux';

import { oneSecond, convertToLocalTimeString } from '../../utils/DayTimeUtil';
import { getUserData } from '../../utils/UserUtil';
import { withMediaQuery } from '../../theme/ThemeUtil';
import { browserName } from '../../utils/BrowserUtil';

import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    chart: {
        height: '100%',
        width: '100%',
        [theme.breakpoints.up('md')]: {
            height: '80%',
            width: '80%',
        },
        padding: '10px',
        marginBottom: '10px',
        marginTop: '20px',
        alignSelf: 'center'
    },
    note: {
        alignSelf: 'center',
        color: 'white',
        marginTop: '20px',
        fontSize: 'medium',
        [theme.breakpoints.down('xs')]: {
            fontSize: 'small'
        },
    }
});

class AccountSummaryChart extends React.Component {

    state = {
        options: {
            chart: {
                id: 'AccountSummaryChart',
                sparkline: {
                    enabled: false
                },
                toolbar: {
                    show: isEqual(browserName(), 'chrome')? true:false,
                    tools: {
                        download: false,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                type: 'area',
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        colors: 'white',
                    },
                },
                type: 'datetime',
                tickAmount: 6,
                min: new Date(this.props.userSession.createdAt).getTime(),
            },
            yaxis: {
                labels: {
                    show: true,
                    style: {
                        colors: 'white',
                    },
                },
                title: {
                    text: 'Portfolio',
                    style: {
                        fontSize: '14px',
                        color: 'white'
                    }
                },
            },
            tooltip: {
                x: {
                  format: 'dd MMM yyyy'
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight',
            },
            grid: {
                show: true
            },
            fill: {
                type: "gradient",
                gradient: {
                    type: 'vertical',
                    shadeIntensity: 0.7,
                    opacityFrom: 0.8,
                    opacityTo: 0.4,
                    stops: [0, 100]
                }
            },
        },

        series: [{
            name: 'Total Portfolio',
            type: 'area',
            data: []
        }]
    }

    intervalCheckThemeBreakpoints;

    setStateChart = (enableSparkline, showToolbar, showLabelsXaxis, showLabelsYaxis) => {
        this.setState({
            options: {
                ...this.state.options,
                chart: {
                    ...this.state.options.chart,
                    sparkline: {
                        enabled: enableSparkline
                    },
                    toolbar: {
                        ...this.state.options.chart.toolbar,
                        show: isEqual(browserName(), 'chrome')? showToolbar:false
                    }
                },
                xaxis: {
                    ...this.state.options.xaxis,
                    labels: {
                        ...this.state.options.xaxis.labels,
                        show: showLabelsXaxis
                    }
                },
                yaxis: {
                    ...this.state.options.yaxis,
                    labels: {
                        ...this.state.options.yaxis.labels,
                        show: showLabelsYaxis
                    }
                },
            }
        })
    }

    checkThemeBreakpointsToChangeChart = () => {
        const { mediaQuery } = this.props;

        const isScreenSmall = mediaQuery;

        // mediaQuery in this case check if theme breakpoints is below sm (600px)
        if(!isScreenSmall && this.state.options.chart.sparkline.enabled) {
            this.setStateChart(false, true, true, true);
        }
        if(isScreenSmall && !this.state.options.chart.sparkline.enabled) {
            this.setStateChart(true, false, false, false);
        }
    }

    initializeChartSeries = () => {
        const dataNeeded = {
            accountSummaryChartInfo: true
        }

        getUserData(dataNeeded, this.props.userSession.email)
        .then(chartInfo => {
            const { accountSummaryChartInfo } = chartInfo;
            let seriesData = [];
            accountSummaryChartInfo.map(timestamp => {
                return seriesData.push([
                    convertToLocalTimeString(timestamp.UTCDateString),
                    timestamp.portfolioValue
                ]);
            });
            this.setState({
                series: [{
                    ...this.state.series[0],
                    data: seriesData
                }]
            });
        })
    }

    componentDidMount() {
        this.intervalCheckThemeBreakpoints = setInterval(
            () => this.checkThemeBreakpointsToChangeChart(),
            oneSecond
        );
        this.initializeChartSeries();
    }

    componentWillUnmount() {
        clearInterval(this.intervalCheckThemeBreakpoints);
    }

    render() {
        const { 
            classes, 
        } = this.props;

        if(!isEmpty(this.state.series.data)) {
            return(
                <Chart 
                    options={this.state.options}
                    series={this.state.series} 
                    className={classes.chart}
                />
            );
        }
        else {
            return(
                <Typography className={classes.note}>    
                    Chart is not updated yet. It's only updated whenever market is closed.
                </Typography>
            )
        }
    }
}

const mapStateToProps = (state) => ({
    userSession: state.userSession,
});

export default connect(mapStateToProps, {})(
    withStyles(styles)(withTheme(withRouter(withMediaQuery('(max-width:600px)')(AccountSummaryChart))))
);
