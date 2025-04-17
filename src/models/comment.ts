export interface CommentState {
  status: CommentStateStatus;
  dataset: CommentStateData[];
  total: number;
  currentPage: number; // min: 1
  size: number;
}

export enum CommentStateStatus {
  NONE,
  IS_FETCHING_COMMENT,
  FETCHING_COMMENTS_FAILED,
  FETCHING_COMMENTS_SUCCEEDED,
  IS_POSTING_COMMENT,
  COMMENTING_SUCCEEDED,
  COMMENTING_FAILED,
  IS_DELETING_COMMENT,
  DELETION_SUCCEEDED,
  DELETION_FAILED,
}

export interface CommentStateData extends CommentDTO {
  // id: number;
  // userId: number;
  // username: string;
  // name: string;
  // avatar?: string;
  // parentId?: number;
  // level: number;
  // content: string;
  // likeCount: number;
  // dislikeCount: number;
  // createdAt: string;
  // modifiedAt: string;
  isOwned: boolean;
  children: CommentStateData[]; // TODO: always search for records with the same level/parentId; append child records to this prop
}

export interface CommentDTO {
  id: number;
  userId: number;
  username: string;
  name: string;
  avatar?: string;
  parentId?: number;
  level: number;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateCommentDTO {
  videoId: string | number;
  content: string;
  parentId?: number;
  level: number;
}

export interface UpdateCommentDTO {
  content: string;
}

// export function toCommentStateData(channelDTO: CommentDTO): CommentStateData {
//   return {
//     id: channelDTO.id,
//     name: channelDTO.name,
//     pathname: channelDTO.pathname,
//     avatar: channelDTO.avatar,
//     cover: channelDTO.cover,
//     description: channelDTO.description,
//     subscriptionCount: 0,
//     createdAt: channelDTO.createdAt,
//     userId: channelDTO.userId,
//     isSubscribed: false,
//     isOwned: false,
//   }
// }
