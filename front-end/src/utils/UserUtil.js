import axios from 'axios';

const typeLoginUtil = ['facebook', 'google'];
const { REACT_APP_BACKEND_HOST : BACKEND_HOST } = process.env;

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

//Forgot password process includes 3 functions below:

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
                password,
                email,  
            },
            withCredentials: true
        })
        .then(() => {
            resolve("Successfully change password");
        })
        .catch(err => {
            reject(err.response.data);
        })
    }); 
}

export default {
    getUser,
    logoutUser,
    loginUser,
    signupUser,
    sendPasswordVerificationCode,
    checkVerificationCode,
    changePassword
}