export const getBackendHost = () => {
  const { REACT_APP_NODE_ENV, REACT_APP_BACKEND_HOST } = process.env;

  if (REACT_APP_NODE_ENV === "development") {
    return `${window.location.origin}/api`;
  } else {
    return REACT_APP_BACKEND_HOST;
  }
};

export const getBackendHostForSocket = () => {
  const { REACT_APP_NODE_ENV, REACT_APP_BACKEND_HOST_FOR_SOCKET } = process.env;

  if (REACT_APP_NODE_ENV === "development") {
    // Special case for ngrok server
    if (window.location.hostname.indexOf(".ngrok.io") > -1) {
      return "type_ngrok_server_4000_here!";
    }
    return `${window.location.hostname}:4000`;
  } else {
    return REACT_APP_BACKEND_HOST_FOR_SOCKET;
  }
};

export default {
  getBackendHost,
  getBackendHostForSocket,
};
