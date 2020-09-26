import axios from "axios";

import { getBackendHost } from "./low-dependency/NetworkUtil";

const BACKEND_HOST = getBackendHost();

/**
 * @returns global flags in back-end { updatedAllUsersFlag, updatedRankingListFlag }
 */
export const getGlobalBackendVariablesFlags = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BACKEND_HOST}/getGlobalBackendVariablesFlags`, {
        withCredentials: true,
      })
      .then((flagsObject) => {
        resolve(flagsObject.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export default {
  getGlobalBackendVariablesFlags,
};
