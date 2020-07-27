import actionTypes from './storeActions/actionTypes';

import userReducer from './storeReducers/user.reducer';
import marketReducer from './storeReducers/market.reducer';

/** 
 * - variable action in addReducer will be obtained from 
 * dispatch(`action`) when we use mapDispatchToProps
 *
 * - variable action will in form of objects declared in 
 * redux/storeActions/actions
 *
 * Use Login.js as example! 
 */

// initial state will be defined in App.js
const initializeStoreState = (initialState) => {
    const chooseAndUseReducer = (state = initialState, action) => {
        switch(action.type) {
            case actionTypes.USER:
                return userReducer(action, state);

            case actionTypes.MARKET:
                return marketReducer(action, state);

            default:
                return state;
        }
    }
    return chooseAndUseReducer;
}
  
export default initializeStoreState;