export const getBackendHost = () => {
    const { REACT_APP_NODE_ENV, REACT_APP_BACKEND_HOST } = process.env;

    if(REACT_APP_NODE_ENV==="development") {
        return `${window.location.origin}/api`;
    }
    else {
        return REACT_APP_BACKEND_HOST;
    }
}

export default {
    getBackendHost
}