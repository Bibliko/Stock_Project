import actionTypes from './actionTypes';

export function userAction(method, whichPropsToChange) {
    return {
        type: actionTypes.USER,
        method, // method: 'logout', 'default'
        whichPropsToChange,
    };
}