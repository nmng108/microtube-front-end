// This file is supposed to shorten usages of env variables by omitting "import.meta.env.VITE_"

export const MAIN_BACKEND_SERVER_ADDRESS: string = import.meta.env.VITE_MAIN_BACKEND_SERVER_ADDRESS;
export const MAIN_BACKEND_SERVER_BASE_PATH: string = import.meta.env.VITE_MAIN_BACKEND_SERVER_BASE_PATH;

const env = {
  MAIN_BACKEND_SERVER_ADDRESS,
  MAIN_BACKEND_SERVER_BASE_PATH,
};

export default env;
