import theme from "../../theme/themeObj";
import themeObj from "../../theme/themeObj";
import { changeOpacityOfRGBAString } from "../../theme/ThemeUtil";

export const highChartDecorations = {
  chart: {
    zoomType: "x",
    backgroundColor: "rgba(255, 255, 255, 0)",
    style: {
      color: "white",
      fontFamily: theme.typography.fontFamily,
    },
  },

  title: {
    text: "",
    style: {
      color: "white",
    },
  },

  // subtitle: {
  //   text: "Note: DRAG to zoom (on web only)",
  //   style: {
  //     color: "white",
  //   },
  // },

  legend: {
    align: "center",
    verticalAlign: "bottom",
    layout: "horizontal",
    borderColor: "white",
    itemHiddenStyle: {
      color: themeObj.palette.normalFontColor.secondary,
    },
    itemHoverStyle: {
      color: themeObj.palette.normalFontColor.secondary,
    },
    itemStyle: {
      color: themeObj.palette.primary.subLight,
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "bold",
      textOverflow: "ellipsis",
    },
  },

  tooltip: {
    crosshairs: {
      color: "rgba(168, 168, 168, 1)",
      dashStyle: "solid",
    },
    shared: true,
  },

  xAxis: {
    labels: {
      enabled: true,
      style: {
        color: "white",
        fontSize: theme.typography.fontSize,
      },
    },
    lineWidth: 0,
    tickWidth: 1,
    breaks: {},
    type: "datetime",
  },

  yAxis: {
    labels: {
      enabled: true,
      style: {
        color: "white",
        fontSize: theme.typography.fontSize,
      },
    },
    allowDecimals: false,
    title: {
      text: "",
      style: {
        color: "white",
      },
    },
    gridLineWidth: 0,
    // gridLineDashStyle: "Dot",
  },

  series: [
    {
      type: "area",
      name: "",
      color: themeObj.palette.primary.subLight,
    },
  ],

  time: {
    useUTC: false,
  },

  plotOptions: {
    series: {
      boostThreshold: 2000,
      turboThreshold: 5000,
      marker: {
        enabled: false,
        fillColor: themeObj.palette.primary.subLight,
      },
    },

    area: {
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
        },
        stops: [
          [
            0,
            changeOpacityOfRGBAString(themeObj.palette.primary.subLight, "0.1"),
          ],
          [
            1,
            changeOpacityOfRGBAString(themeObj.palette.primary.subLight, "0.5"),
          ],
        ],
      },
      marker: {
        radius: 2,
      },
      lineWidth: 2,
      lineColor: themeObj.palette.primary.subLight,
      states: {
        hover: {
          lineWidth: 2.5,
          lineColor: themeObj.palette.primary.subLight,
        },
      },
      threshold: null,
    },
  },

  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 400,
        },
        chartOptions: {
          yAxis: {
            labels: {
              enabled: false,
            },
            title: {
              text: null,
            },
          },
          subtitle: {
            text: null,
          },
          credits: {
            enabled: false,
          },
        },
      },
    ],
  },
};

export default {
  highChartDecorations,
};
