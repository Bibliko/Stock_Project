import {userRanking} from './userRanking';
import {combineReducers} from 'redux';
import storeReducer from '../storeReducer'

export default combineReducers({
  overallRanking: userRanking,
  storeReducer
})
