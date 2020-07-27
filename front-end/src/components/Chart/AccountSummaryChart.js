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
                toolbar: {
                    show: true,
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
                type: 'area'
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        colors: 'white',
                    },
                },
                type: 'datetime',
                categories: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan", "07 Jan", "08 Jan"],
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
            stroke: {
                curve: 'straight',
            },
            grid: {
                show: false
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
            title: {
                text: '$100000',
                style: {
                  fontSize:  '18px',
                  fontWeight: 600,
                  color:  'white'
                },
            },
            subtitle: {
                text: 'Cash on hand',
                margin: 20,
                style: {
                  fontSize:  '12px',
                  color:  'white'
                },
            }
        },

        series: [{
            name: 'Total Portfolio',
            type: 'area',
            data: [30, 40, 45, 50, 49, 60, 70, 91]
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
                        show: showToolbar
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
