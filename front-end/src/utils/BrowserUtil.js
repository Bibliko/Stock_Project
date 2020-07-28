const { detect } = require('detect-browser');
const browser = detect();

export const browserName = () => {
    return browser? browser.name:"";
}

export const browserVersion = () => {
    return browser? browser.version:"";
}

export const browserOS = () => {
    return browser? browser.os:"";
}

export default {
    browserName,
    browserVersion,
    browserOS
}
