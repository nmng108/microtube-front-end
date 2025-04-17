// import { createPathBuilder } from '../utilities';

const authPath: string = "/auth";
// const getAuthPath = createPathBuilder('/');

export default {
  INDEX: '/',
  AUTH: authPath,
  AUTH_LOGIN: `${authPath}/login`,
  AUTH_REGISTER: `${authPath}/register`,
  CHANNEL: '/channel',
};
