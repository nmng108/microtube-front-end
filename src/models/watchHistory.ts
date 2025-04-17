import { ConciseVideoData } from '@models/video.ts';

export interface WatchHistoryState {
  status: WatchHistoryStateStatus;
  problemMessage?: string;
  dataset: WatchHistoryRecord[];
  page: number;
  size: number;
}

export enum WatchHistoryStateStatus {
  NONE,
  IS_FETCHING,
  FETCHING_FAILED,
  FETCHING_SUCCEEDED,
  IS_DELETING,
  DELETION_FAILED,
  DELETION_SUCCEEDED,
}

export interface WatchHistoryRecord extends ConciseVideoData {
  historyRecordId: number;
  pausePosition: number;
}

export interface WatchHistoryDTO {
  readonly id: number;
  pausePosition: number;
  readonly videoId: number | null;
  readonly code: string;
  readonly title: string;
  thumbnail?: string;
  url?: string;
  viewCount: number;
  // likeCount: number;
  // dislikeCount: number;
  readonly channelId: number | null;
  channelName?: string;
  channelPathname?: string;
  channelAvatar?: string;
  readonly createdAt: string; // Using string for ISO 8601 format of Instant
}

export interface AppendHistoryRecordDTO {
  videoId: string | number;
  pausePosition: number;
}

export function convertWatchHistoryDTOtoRecord(dto: WatchHistoryDTO): WatchHistoryRecord {
  return {
    historyRecordId: dto.id,
    pausePosition: dto.pausePosition,

    id: dto.videoId,
    code: dto.code,
    title: dto.title,
    visibility: null,
    status: null,
    thumbnail: dto.thumbnail || '',
    viewCount: dto.viewCount,
    createdAt: new Date(dto.createdAt).getTime(),
    createdBy: dto.channelId,
    isOwned: false, // You'll likely need to determine this based on user context
    channelId: dto.channelId,
    channelPathname: dto.channelPathname || '',
    channelName: dto.channelName || '',
    channelAvatar: dto.channelAvatar || '',
  };
}
