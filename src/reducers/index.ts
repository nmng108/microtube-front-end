import { combineReducers } from 'redux';

// reducers
import user from './user';
import feed from './feed';
import video from './video';
import channel from './channel';
import sidebar from './sidebar';
import recommendation from './recommendation';
import channelRecommendation from './channelRecommendation';
import searchResult from './searchResult.ts';
import trending from './trending';
import likedVideos from './likedVideos';
import history from './history';

// interface StateStore {
//   user: UserData,
//   feed: unknown,
//   video: unknown,
//   profile: unknown,
//   sidebar: unknown,
//   recommendation: unknown,
//   channelRecommendation: unknown,
//   searchResult: unknown,
//   trending: unknown,
//   likedVideo: unknown,
//   history: unknown,
// }

export default {
  user,
  feed,
  video,
  channel,
  sidebar,
  recommendation,
  channelRecommendation,
  searchResult,
  trending,
  likedVideos,
  history,
};

export * from './user';
export * from './feed';
export * from './video';
export * from './channel';
export * from './sidebar';
export * from './recommendation';
export * from './channelRecommendation';
export * from './searchResult.ts';
export * from './trending';
export * from './likedVideos';
export * from './history';
