import { PagingRequest } from './base.ts';
import { CommentState } from '@models/comment.ts';

export interface LikedVideoListState {
  status: VideoListStateStatus;
  problemMessage?: string,
  dataset: ConciseVideoData[];
}

export interface RecommendationListState {
  isFetching: boolean;
  data?: unknown;
  videos: ConciseVideoData[];
}

export enum VideoListStateStatus {
  NONE,
  IS_FETCHING,
  FETCHING_FAILED,
  FETCHING_SUCCEEDED,
}

export interface ConciseVideoData {
  id: number;
  code: string;
  title: string;
  description?: string;
  visibility: VideoVisibilityEnum;
  status: VideoStatusEnum;
  thumbnail: string;
  viewCount: number;
  createdAt: number; // different from DTO
  createdBy: number;
  isOwned: boolean;
  channelId: number;
  channelPathname: string;
  channelName: string;
  channelAvatar: string;
}

export interface DetailVideoData extends ConciseVideoData {
  url: string;
  liked: boolean;
  disliked: boolean;
  likeCount: number;
  dislikeCount: number;
  modifiedAt: number; // different from DTO
  modifiedBy: number;
}

export interface VideoState {
  status: VideoStateStatus;
  problemMessage?: string;
  data: DetailVideoData;
  comment: CommentState;
}

export enum VideoStateStatus {
  NONE,
  IS_FETCHING,
  FETCHING_FAILED,
  FETCHING_SUCCEEDED,
}

export interface VideoDTO {
  id: number;
  code: string;
  title: string;
  description: string;
  visibility: {
    number: VideoVisibilityEnum,
    code: string,
    name: string
  };
  status: {
    number: VideoStatusEnum,
    code: string,
    name: string
  };
  thumbnail?: string;
  url?: string;
  reaction?: VideoReactionEnum; // true: liked, false: disliked, null|undefined: none
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  createdBy: number;
  modifiedAt: string;
  modifiedBy: number;
  channelId: number;
  channelPathname: string;
  channelName: string;
  channelAvatar: string;
}

export interface SearchVideoDTO extends PagingRequest {
  ids?: number[];
  codes?: string[];
  name?: string; // name, description, hashtag, etc.
  visibility?: VideoVisibilityEnum;
  status?: VideoStatusEnum;
  resolutions?: string[];
  channelId?: number;
  reaction?: VideoReactionEnum;
  subscribed?: boolean;
}

export interface CreateVideoDTO {
  title: string;
  description?: string;
  visibility: VideoVisibilityEnum;
  allowsComment: boolean;
}

export interface UpdateVideoDTO {
  updateType: VideoUpdateType;
  title?: string;
  description?: string;
  visibility?: VideoVisibilityEnum;
  allowsComment?: boolean;
}


export enum VideoVisibilityEnum {
  PUBLIC = 3,
  UNLISTED = 2,
  PRIVATE = 1,
}

export enum VideoStatusEnum {
  CREATING,
  CREATED,
  PROCESSING,
  READY,
  FAILED,
}

export enum VideoUpdateType {
  UPDATE_INFO,
  LIKE,
  DISLIKE,
  CANCEL_LIKE,
  CANCEL_DISLIKE,
  INCREASE_VIEW,
}

export enum VideoReactionEnum {
  LIKE = 1,
  DISLIKE = 2,
}

export function toDetailVideoData(videoDTO: VideoDTO): DetailVideoData {
  return {
    id: videoDTO.id,
    code: videoDTO.code,
    title: videoDTO.title,
    description: videoDTO.description,
    visibility: videoDTO.visibility?.number,
    status: videoDTO.status?.number,
    thumbnail: videoDTO.thumbnail,
    url: videoDTO.url,
    liked: videoDTO.reaction === VideoReactionEnum.LIKE,
    disliked: videoDTO.reaction === VideoReactionEnum.DISLIKE,
    viewCount: videoDTO.viewCount,
    likeCount: videoDTO.likeCount || 0,
    dislikeCount: videoDTO.dislikeCount || 0,
    createdAt: new Date(videoDTO.createdAt).getTime(),
    createdBy: videoDTO.createdBy,
    modifiedAt: videoDTO.modifiedAt ? new Date(videoDTO.modifiedAt).getTime() : null,
    modifiedBy: videoDTO.modifiedBy,
    isOwned: false,
    channelId: videoDTO.channelId,
    channelPathname: videoDTO.channelPathname,
    channelName: videoDTO.channelName,
    channelAvatar: videoDTO.channelAvatar,
  };
}
