import { ConciseVideoData } from '@models/video.ts';

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
  IS_UPDATING,
  UPDATE_SUCCEEDED,
  UPDATE_FAILED,
}

export interface ChannelStateData {
  id: number;
  name: string;
  pathname: string;
  avatar?: string;
  cover?: string;
  description?: string;
  subscriptionCount?: number;
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
  createdAt: string;
  userId: number;
  subscribed?: boolean;
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
    createdAt: channelDTO.createdAt,
    userId: channelDTO.userId,
    subscribed: channelDTO.subscribed,
    isOwned: false,
    videos: [],
  }
}
