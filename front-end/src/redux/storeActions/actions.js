import actionTypes from './actionTypes';

// These actions is used for dispatch function when Redux mapDispatchToProps is used in components

export function userAction(method, whichPropsToChange) {
    return {
        type: actionTypes.USER,
        method, // method: 'logout', 'default'
        whichPropsToChange,
    };
}