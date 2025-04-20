// import { createPathBuilder } from '../utilities';

const authPath: string = '/auth';
// const getAuthPath = createPathBuilder('/');

const routes = {
  INDEX: '/',
  AUTH: authPath,
  AUTH_LOGIN: `${authPath}/login`,
  AUTH_REGISTER: `${authPath}/register`,
  USER_PROFILE: '/profile',
  SEARCH: '/search',
  WATCH: '/watch',
  WATCH_WITH_PARAM: '/watch/:videoId',
  CHANNEL: '/channel',
  CHANNEL_WITH_PARAM: '/channel/:pathname',
  LIKED_VIDEOS: '/liked-videos',
  WATCH_HISTORY: '/watch-history',
};

export default routes;

export function getLoginPathWithContinuedPath(path: string) {
  return `${routes.AUTH_LOGIN}?continue=${encodeURIComponent(path)}`;
}