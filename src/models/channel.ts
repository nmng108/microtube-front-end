import { ConciseVideoData } from '@models/video.ts';
import { PagingRequest } from '@models/base.ts';

export interface ChannelState {
  status: ChannelStateStatus;
  problemMessage?: string;
  data: ChannelStateData;
}

export enum ChannelStateStatus {
  NONE,
  IS_FETCHING,
  FETCHING_FAILED,
  FETCHING_SUCCEEDED,

  IS_FETCHING_VIDEOS,
  FETCHING_VIDEOS_FAILED,
  FETCHING_VIDEOS_SUCCEEDED,

  IS_UPDATING,
  UPDATE_SUCCEEDED,
  UPDATE_FAILED,

  IS_UPLOADING,
  UPLOAD_SUCCEEDED,
  UPLOAD_FAILED,
}

export interface ChannelStateData {
  id: number;
  name: string;
  pathname: string;
  avatar?: string;
  cover?: string;
  description?: string;
  subscriptionCount: number;
  videoCount: number;
  createdAt: string;
  userId: number;
  subscribed: boolean;
  isOwned: boolean;
  videos: ConciseVideoData[];
}

export interface ChannelDTO {
  id: number;
  name: string;
  pathname: string;
  avatar?: string;
  cover?: string;
  description?: string;
  subscriptionCount: number;
  videoCount: number;
  createdAt: string;
  userId: number;
  subscribed?: boolean;
}

export interface SearchChannelDTO extends PagingRequest {
  name?: string;
  subscribed?: boolean;
}

export interface CreateChannelDTO {
  name: string;
  pathname: string;
  description?: string;
}

export interface UpdateChannelDTO {
  name?: string;
  pathname?: string;
  description?: string;
}

export function toChannelStateData(channelDTO: ChannelDTO): ChannelStateData {
  return {
    id: channelDTO.id,
    name: channelDTO.name,
    pathname: channelDTO.pathname,
    avatar: channelDTO.avatar,
    cover: channelDTO.cover,
    description: channelDTO.description,
    subscriptionCount: channelDTO.subscriptionCount,
    videoCount: channelDTO.videoCount,
    createdAt: channelDTO.createdAt,
    userId: channelDTO.userId,
    subscribed: channelDTO.subscribed,
    isOwned: false,
    videos: [],
  }
}
