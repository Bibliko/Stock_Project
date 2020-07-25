export const getBackendHost = () => {
    const { REACT_APP_NODE_ENV, REACT_APP_BACKEND_HOST } = process.env;

    console.log(window.location);

    if(REACT_APP_NODE_ENV==="development") {
        return `${window.location.origin}/api`;
    }
    else {
        return REACT_APP_BACKEND_HOST;
    }
}

export const getBackendHostForSocket = () => {
    const { REACT_APP_NODE_ENV, REACT_APP_BACKEND_HOST_FOR_SOCKET } = process.env;

    if(REACT_APP_NODE_ENV==="development") {
        return `${window.location.hostname}:4000`;
    }
    else {
        return REACT_APP_BACKEND_HOST_FOR_SOCKET;
    }
}

export default {
    getBackendHost,
    getBackendHostForSocket
}