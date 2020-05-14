import { createStore } from 'redux';
import reducers from './storeReducer';

const store = createStore(reducers);

export default store;