import React from 'react';
import Chart from 'react-apexcharts';
import { withRouter } from 'react-router';

import { oneSecond } from '../../utils/DayTimeUtil';
import { withMediaQuery } from '../../theme/ThemeUtil';

import { withStyles, withTheme } from '@material-ui/core/styles';

const styles = theme => ({
    chart: {
        height: '100%',
        width: '100%',
        padding: '10px'
    }
});

class AccountSummaryChart extends React.Component {

    state = {
        options: {
            chart: {
                id: 'Testing',
                sparkline: {
                    enabled: false
                },
                type: 'area'
            },
            xaxis: {
                labels: {
                    style: {
                        colors: 'white',
                    },
                },
                categories: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan", "07 Jan", "08 Jan"],
            },
            yaxis: {
                labels: {
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
            stroke: {
                curve: 'straight'
            },
            fill: {
                type: "gradient",
                gradient: {
                    type: 'vertical',
                    shadeIntensity: 0.7,
                    opacityFrom: 0.9,
                    opacityTo: 0.7,
                    stops: [0, 90, 100]
                }
            },
        },

        series: [{
            name: 'Total Portfolio',
            type: 'area',
            data: [30, 40, 45, 50, 49, 60, 70, 91]
        }]
    }

    intervalCheckThemeBreakpoints;

    checkThemeBreakpointsToChangeChart = () => {
        const { mediaQuery } = this.props;

        // mediaQuery in this case check if theme breakpoints is below sm (600px)
        if(!mediaQuery && this.state.options.chart.sparkline.enabled) {
            console.log('hi1');
            this.setState({
                options: {
                    ...this.state.options,
                    chart: {
                        ...this.state.options.chart,
                        sparkline: {
                            enabled: false
                        }
                    }
                }
            })
        }
        if(mediaQuery && !this.state.options.chart.sparkline.enabled) {
            console.log('hi2');
            this.setState({
                options: {
                    ...this.state.options,
                    chart: {
                        ...this.state.options.chart,
                        sparkline: {
                            enabled: true
                        }
                    }
                },
            })
        }
    }

    componentDidMount() {
        this.intervalCheckThemeBreakpoints = setInterval(
            () => this.checkThemeBreakpointsToChangeChart(),
            oneSecond
        );
    }

    componentWillUnmount() {
        clearInterval(this.intervalCheckThemeBreakpoints);
    }

    render() {
        const { 
            classes, 
        } = this.props;

        return(
            <Chart 
                options={this.state.options}
                series={this.state.series} 
                className={classes.chart}
            />
        );
    }
}

export default withStyles(styles)(withTheme(withRouter(withMediaQuery('(max-width:600px)')(AccountSummaryChart))));
