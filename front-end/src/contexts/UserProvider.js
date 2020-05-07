import React, { createContext } from "react";
import _ from 'lodash';
import {
    withRouter,
} from 'react-router-dom';
import axios from 'axios';

const context = createContext(null);

class UserProvider extends React.Component {
    state = {
        logIn: false,
    }

    typeLogin = ['facebook', 'google'];

    getUser = () => {
        return new Promise((resolve, reject) => {
            axios.get('/api/user')
            .then(res => {
                resolve(res);
            })
            .catch(e => {
                console.log(e);
                reject(e);
            })
        });
    }

    componentCheck() {
        this.getUser()
        .then(user => {
            if(!_.isEmpty(user.data))
                this.setState({
                    logIn: true
                })
        })
        .catch(err => {
            console.log(err);
        })
    }

    componentDidMount() {
        this.componentCheck();
    }

    componentDidUpdate() {
        this.componentCheck();
    }

    logoutUser = () => {
        this.setState({
            logIn: false
        });
        axios.get('/api/logout');
    }

    loginUser = (typeLogin, credentials) => {
        return new Promise((resolve, reject) => {
            if(this.typeLogin.indexOf(typeLogin)>=0) {
                window.location = `/api/auth/${typeLogin}`;
                resolve("Successful");
            }
            else {  //typeLogin==='local'
                axios.post('/api/auth/login', credentials)
                .then(res => {
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
            axios.post('/api/auth/signup', credentials)
            .then(res => {
                resolve("Successful");
            })
            .catch(e => {
                reject(e.response.data.message);
            })
        });
    }

    forceReloadPage = () => {
        //this.componentDidMount();
    }

    render() {


        return (
            <context.Provider 
                value={{
                    getUser: this.getUser,
                    logoutUser: this.logoutUser,
                    loginUser: this.loginUser,
                    signupUser: this.signupUser,
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