import axios from "axios";
import { getBackendHost } from "./low-dependency/NetworkUtil";


const BACKEND_HOST = getBackendHost();

export const getOneCompanyRating = (symbol) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/companyRating/getOneCompany`, {
      method: "get",
      params: { symbol },
      withCredentials: true,
    })
      .then((companyRating) => {
        resolve(companyRating.data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const getAllCompaniesRating = () => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/companyRating/getAllCompanies`, {
      method: "get",
      withCredentials: true,
    })
      .then((companiesRating) => {
        resolve(companiesRating.data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export default {
  getOneCompanyRating,
  getAllCompaniesRating,
};
