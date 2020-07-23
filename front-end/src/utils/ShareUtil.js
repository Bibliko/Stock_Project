import axios from 'axios';

const {
    REACT_APP_BACKEND_HOST: BACKEND_HOST
} = process.env;

export const changeShareData = (dataNeedChange, id) => {
    /**
     * dataNeedChange in form: 
     *  dataNeedChange: {
     *      password: "...",
     *      email: "...",
     *      [...]
     *  }
     */

    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/shareData/changeData`, {
            method: 'put',
            data: {
                id, 
                dataNeedChange
            },
            withCredentials: true
        })
        .then(shareDataRes => {
            console.log(shareDataRes);
            resolve("Successfully change data");
        })
        .catch(err => {
            reject(err);
        })
    }); 
}

export const getShareData = (dataNeeded, id) => {
    /** 
     *  dataNeeded in form of:
     *      dataNeeded: {
     *          cash: true,
     *          region: true,
     *          ...
     *      }
     */

    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/shareData/getData`, {
            method: 'get',
            params: {
                id, 
                dataNeeded
            },
            withCredentials: true
        })
        .then(shareData => {
            resolve(shareData.data);
        })
        .catch(err => {
            reject(err);
        })
    }); 
}

export default {
    changeShareData,
    getShareData,
}