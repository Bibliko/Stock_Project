import theme from './themeObj';
import { createMuiTheme } from '@material-ui/core/styles';

import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export const withMediaQuery = (...args) => Component => props => {
  const mediaQuery = useMediaQuery(...args);
  return <Component mediaQuery={mediaQuery} {...props} />;
};

var muiTheme = {};

var prefersDarkMode = false;

// Functions for ThemeProvider
const ColorLuminance = (hex, lum) => {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}

const customizeTheme = (theme) => {
    theme.getColor = getColor;
    for (let colorKey in theme.palette) {
        const color = theme.palette[colorKey];
        if (color.main) {
            if (!color.light)
                theme.palette[colorKey].light = ColorLuminance(color.main, 0.2);
            if (!color.dark)
                theme.palette[colorKey].dark = ColorLuminance(color.main, -0.2);
            }
    }   
    return theme;
}

const getColor = (colorChoice) => {
    for (let colorKey in muiTheme.palette) {
        if (colorKey === colorChoice) {
            const color = this.muiTheme.palette[colorKey];
            return prefersDarkMode? color.dark : color.light;
        }
    }
}

export const createTheme = () => {
    theme.palette.type = prefersDarkMode? 'dark' : 'light';
    muiTheme = customizeTheme(createMuiTheme(theme));
    return muiTheme;
}

export const toggleTheme = () => {
    prefersDarkMode = !prefersDarkMode;
}

export default {
    toggleTheme,
    createTheme,
    withMediaQuery
}