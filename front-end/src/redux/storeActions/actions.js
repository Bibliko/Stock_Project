import actionTypes from "./actionTypes";

// These actions is used for dispatch function when Redux mapDispatchToProps is used in components

export function userAction(method, whichPropsToChangeOrWhatDataForChanging) {
  return {
    type: actionTypes.USER,
    method, // method: "logout", "default"
    whichPropsToChangeOrWhatDataForChanging,
  };
}

export function orderAction(method, dataToChange) {
  return {
    type: actionTypes.ORDER,
    method, // method: "change", "clear"
    dataToChange,
  };
}

export function marketAction(method) {
  return {
    type: actionTypes.MARKET,
    method, // method: "openMarket", "closeMarket"
  };
}
