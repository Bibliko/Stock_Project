import axios from 'axios';

import { getBackendHost } from "./low-dependency/NetworkUtil";
const BACKEND_HOST = getBackendHost();

export const placeOrder = (userId, orderData) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/transaction/placeOrder`, {
      method: 'put',
      data: {
        userId,
        orderData,
      },
      withCredentials: true,
    })
      .then((message) => resolve(message))
      .catch(err => reject(err));
  });
};

export const amendOrder = (id, orderData) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/transaction/amendOrder`, {
      method: 'put',
      data: {
        id,
        orderData,
      },
      withCredentials: true,
    })
      .then((message) => resolve(message))
      .catch(err => reject(err));
  });
};

export const deleteOrder = (id) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/transaction/deleteOrder`, {
      method: 'delete',
      data: { id },
      withCredentials: true,
    })
      .then((message) => resolve(message))
      .catch(err => reject(err));
  });
};

export default {
  placeOrder,
  amendOrder,
  deleteOrder,
};
