import { create, ApisauceConfig } from 'apisauce';
import { MAIN_BACKEND_SERVER_ADDRESS, MAIN_BACKEND_SERVER_BASE_PATH } from '../env.ts';
import { isNotBlank } from '@utilities';

// const apiConfigs: ApisauceConfig = {
//   baseURL: undefined,
//   headers: {
//     // 'Access-Control-Allow-Credentials': '*',
//   },
// };

// export const mainBackend = create({
//   ...apiConfigs,
//   baseURL: `${MAIN_BACKEND_SERVER_ADDRESS}`,
// });
// export const mainBackendWithBasePath = create({
//   ...apiConfigs,
//   baseURL: `${MAIN_BACKEND_SERVER_ADDRESS}${MAIN_BACKEND_SERVER_BASE_PATH}`,
// });

const restfulApiConfigs: ApisauceConfig = {
  baseURL: undefined,
  responseEncoding: 'utf-8',
  timeout: 120000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Credentials': '*',
  },
};

// export const restfulMainBackend = create({
//   ...restfulApiConfigs,
//   baseURL: `${MAIN_BACKEND_SERVER_ADDRESS}`,
// });
export const restfulMainBackendWithBasePath = create({
  ...restfulApiConfigs,
  baseURL: `${MAIN_BACKEND_SERVER_ADDRESS}${MAIN_BACKEND_SERVER_BASE_PATH}`,
});

// Set this interceptor to send Authorization header in case cookie doesn't work (should only use this for test purpose)
// restfulMainBackendWithBasePath.axiosInstance.interceptors.request.use((axiosConfig) => {
//   if (axiosConfig.headers.hasAuthorization(/^Bearer [\w-]+(\.[\w-]+){2}$/)) {
//     return axiosConfig;
//   }
//
//   const bearerToken = localStorage.getItem('token');
//
//   if (bearerToken && isNotBlank(bearerToken)) {
//     if (axiosConfig.headers.Authorization !== bearerToken) {
//       axiosConfig.headers.Authorization = bearerToken;
//     }
//   }
//
//   return axiosConfig;
// });

export default {
  /*mainBackend, mainBackendWithBasePath, restfulMainBackend, */restfulMainBackendWithBasePath, restfulApiConfigs,
};
