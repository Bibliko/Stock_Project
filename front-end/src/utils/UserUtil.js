import axios from 'axios';
import _ from 'lodash';

const typeLoginUtil = ['facebook', 'google'];
const { REACT_APP_BACKEND_HOST : BACKEND_HOST } = process.env;

// User Authorization and Login Related:

export const getUser = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${BACKEND_HOST}/user`, {withCredentials: true})
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            console.log(e);
            reject(e);
        })
    });
}

export const logoutUser = () => {
    return new Promise ((resolve, reject) => {
        axios.get(`${BACKEND_HOST}/logout`, {withCredentials: true})
        .then(() => {
            resolve("Successful");
        })
        .catch(err => {
            reject(err);
        })
    })
}

export const loginUser = (typeLogin, credentials) => {
    return new Promise((resolve, reject) => {
        if(typeLoginUtil.indexOf(typeLogin)>=0) {
            window.location = `${BACKEND_HOST}/auth/${typeLogin}`;
            resolve("Successful");
        }
        else {  //typeLogin==='local'
            axios(`${BACKEND_HOST}/auth/login`, {
                method: 'post',
                data: credentials,
                withCredentials: true
            })
            .then(() => {
                resolve("Successful");
            })
            .catch(e => {
                reject(e.response.data.message);
            })
        }
    });
}

export const signupUser = (credentials) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/auth/signup`, {
            method: 'post',
            data: credentials,
            withCredentials: true
        })
        .then(res => {
            resolve(res.data.message);
        })
        .catch(e => {
            reject(e.response.data.message);
        })
    });
}

// Forgot password process includes 3 functions below:

export const sendPasswordVerificationCode = (email) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/passwordVerification`, {
            method: 'get',
            params: {
                email,  
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res.data.message);
        })
        .catch(err => {
            reject(err.response.data);
        })
    })
}

export const checkVerificationCode = (code) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/checkVerificationCode`, {
            method: 'get',
            params: {
                code,  
            },
            withCredentials: true
        })
        .then(() => {
            resolve("Successful");
        })
        .catch(err => {
            reject(err.response.data);
        })
    });
}

export const changePassword = (password, email) => {    
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/userData/changeData`, {
            method: 'put',
            data: {
                email,  
                dataNeedChange: {
                    password,
                }
            },
            withCredentials: true
        })
        .then(() => {
            resolve("Successfully change password");
        })
        .catch(err => {
            reject("Your email or credentials may be wrong.");
        })
    }); 
}

// User Data Related:

export const changeUserData = (dataNeedChange, email) => {
    /**
     * dataNeedChange in form: 
     *  dataNeedChange: {
     *      password: "...",
     *      email: "...",
     *      [...]
     *  }
     */

    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/userData/changeData`, {
            method: 'put',
            data: {
                email, 
                dataNeedChange
            },
            withCredentials: true
        })
        .then(() => {
            resolve("Successfully change data");
        })
        .catch(err => {
            reject(err);
        })
    }); 
}

export const getUserData = (dataNeeded, email) => {
    /** 
     *  dataNeeded in form of:
     *      dataNeeded: {
     *          cash: true,
     *          region: true,
     *          ...
     *      }
     */

    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/userData/getData`, {
            method: 'get',
            params: {
                email, 
                dataNeeded
            },
            withCredentials: true
        })
        .then(userData => {
            resolve(userData.data);
        })
        .catch(err => {
            reject(err);
        })
    }); 
}

// User Calculations Related:

// example of stockQuotesJSON in back-end/utils/FinancialModelingPrepUtil.js
export const calculateTotalSharesValue = (stockQuotesJSON, email) => {
    return new Promise((resolve, reject) => {
        if(_.isEmpty(stockQuotesJSON)) {
            resolve(0);
        }

        var totalValue = 0;

        var dataNeeded = {
            shares: true
        };

        getUserData(dataNeeded, email)
        .then(userShares => {
            let { shares: sharesResult } = userShares;

            for (let stockQuote of stockQuotesJSON) {

                let quantityOfUserShareWithMatchedSymbol = 0;
                
                // filter shares of user having matched symbol with this stock quote
                const arraySharesWithMatchedSymbol = sharesResult.filter(
                    share => _.isEqual(share.companyCode, stockQuote.symbol)
                );

                // add quantities of all shares with matched symbol together
                for (let shareWithMatchedSymbol of arraySharesWithMatchedSymbol) {
                    quantityOfUserShareWithMatchedSymbol += shareWithMatchedSymbol.quantity;
                }

                // add into total value this stock value: stock price * stock quantity
                totalValue += stockQuote.price * quantityOfUserShareWithMatchedSymbol;
            }   
        
            resolve(totalValue);
        })
        .catch(err => {
            reject(err);
        })
    })
}

export default {
    getUser,
    logoutUser,
    loginUser,
    signupUser,
    sendPasswordVerificationCode,
    checkVerificationCode,
    changePassword,
    changeUserData,
    getUserData,
    calculateTotalSharesValue
}