import actionTypes from './actionTypes';
import Axios from 'axios'

// These actions is used for dispatch function when Redux mapDispatchToProps is used in components

export const fetchUserRegionalRanking= ()=> async dispatch =>{
  const res= await Axios.get('/api/userData/getRegionalRanking')
  dispatch ({
    type: actionTypes.USERREGIONALRANKING,
    payload: res.data
  })

}

export const fetchUserOverallRanking = ()=> async dispatch => {
  const res= await  Axios.get('api/userData/getOverallRanking');

  dispatch ({
    type: actionTypes.USERRANKING,
    payload: res.data
  });
};

export function userAction(method, whichPropsToChangeOrWhatDataForChanging) {
    return {
        type: actionTypes.USER,
        method, // method: 'logout', 'default'
        whichPropsToChangeOrWhatDataForChanging,
    };
}

export function marketAction(method) {
    return {
        type: actionTypes.MARKET,
        method, // method: 'openMarket', 'closeMarket'
    };
}
