import actionTypes from './storeActions/actionTypes';

import userReducer from './storeReducers/user.reducer';

const initialState = {
    userSession: {},
};

/* action will be obtained from dispatch(`action`) when we use mapDispatchToProps
 * Use Login.js as example! 
 */

function addReducer(state = initialState, action) {
    switch(action.type) {
        case actionTypes.USER:
            return userReducer(action, state);

        default:
            return state;
     }
}
  
export default addReducer;