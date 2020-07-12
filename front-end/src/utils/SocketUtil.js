import axios from 'axios';

const {
    REACT_APP_BACKEND_HOST: BACKEND_HOST
} = process.env;

/** Usage setupUserInformation
 * Use to set up user information for back-end Socket
 */
export const setupUserInformation = "setupUserInformation";

/** Usage checkStockQuotesForUser
 * Use to check stock quotes of user
 */
export const checkStockQuotesForUser = "checkStockQuotesForUser";

export const updateUserDataForSocket = (socket) => {
    axios.get(`${BACKEND_HOST}/user`, {withCredentials: true})
    .then(user => {
      socket.emit(setupUserInformation, user.data);
    })
    .catch(e => {
      console.log(e);
    })
}

export default {
    setupUserInformation,
    checkStockQuotesForUser,
    updateUserDataForSocket
}