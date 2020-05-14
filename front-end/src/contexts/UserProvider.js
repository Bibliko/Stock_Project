import React, { createContext } from "react";
//import _ from 'lodash';
import {
    withRouter,
} from 'react-router-dom';
import axios from 'axios';

const context = createContext(null);
const { REACT_APP_BACKEND_HOST : BACKEND_HOST } = process.env;

class UserProvider extends React.Component {

    typeLogin = ['facebook', 'google'];

    getUser = () => {
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

    logoutUser = () => {
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

    loginUser = (typeLogin, credentials) => {
        return new Promise((resolve, reject) => {
            if(this.typeLogin.indexOf(typeLogin)>=0) {
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

    signupUser = (credentials) => {
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
    sendPasswordVerificationCode = (email) => {
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
    checkVerificationCode = (code) => {
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
    changePassword = (password, email) => {
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

    render() {


        return (
            <context.Provider 
                value={{
                    getUser: this.getUser,
                    logoutUser: this.logoutUser,
                    loginUser: this.loginUser,
                    signupUser: this.signupUser,
                    sendPasswordVerificationCode: this.sendPasswordVerificationCode,
                    checkVerificationCode: this.checkVerificationCode,
                    changePassword: this.changePassword
                }} 
            >
                {this.props.children}
            </context.Provider>
        );
    }
}

UserProvider = withRouter(UserProvider);
UserProvider.context = context;

export default UserProvider;