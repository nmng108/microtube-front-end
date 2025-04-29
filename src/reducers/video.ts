import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  type DetailVideoData,
  toDetailVideoData,
  VideoReactionEnum,
  type VideoState,
  VideoStateStatus,
  VideoUpdateType,
} from '../models/video';
import { videoResource } from '../api';
import { type BaseAsyncThunkConfig } from '@redux-store.ts';
import { CommentState, CommentStateData, CommentStateStatus } from '@models/comment.ts';
import commentResource from '@api/commentResource.ts';

const DEFAULT_COMMENT_FETCH_SIZE: number = 10;
const DEFAULT_COMMENT_REPLY_FETCH_SIZE: number = 5;

// TODO: make use of rejectWithValue instead of using `throw`

/**
 * Called inside the `WatchVideo` component to fetch detail info of the specified video.
 */
export const getVideo = createAsyncThunk<DetailVideoData, number | string, BaseAsyncThunkConfig>(
  'video/getVideo',
  async (videoId: number | string, { getState }) => {
    const { ok, problem, data } = await videoResource.get(videoId);

    if (ok) {
      const resultStateData: DetailVideoData = toDetailVideoData(data.data);
      const ownedChannelId: number | undefined = getState().user.data?.ownedChannel?.id;

      if (ownedChannelId > 0) {
        resultStateData.isOwned = ownedChannelId === data.data.channelId;
      }

      return resultStateData;
    }

    throw new Error(`Cannot fetch video. Reason: ${problem}`);
  }
);

/**
 * @return {undefined} if not found.
 */
function findCommentRecursively(commentState: CommentState, id: number, level: number): CommentStateData {
  // Stop immediately if dataset is empty or level of the dataset is larger than specified level.
  if (commentState?.dataset?.length == 0 || commentState.dataset[0].level > level) {
    return;
  }

  for (const commentStateData of commentState.dataset) {
    if (commentStateData.level < level) {
      const matchingChild = findCommentRecursively(commentStateData.children, id, level);

      if (matchingChild) return matchingChild;
    } else if (commentStateData.id == id) {
      return commentStateData;
    }
  }
}

type GetCommentsArgs = {
  /**
   * If not specified, default to level-1 comments.
   */
  parentId?: number;
  parentLevel?: number; // specify this along with parentId to optimize search time
};

type GetCommentsOutput = {
  dataset: CommentStateData[];
  total: number;
  page: number;
};

/**
 * Fetch next page with fixed page size.
 */
export const getComments = createAsyncThunk<GetCommentsOutput, GetCommentsArgs, BaseAsyncThunkConfig>(
  'video/getComments',
  async ({ parentId, parentLevel }, { getState }) => {
    const videoId = getState().video.data.code;

    if (!videoId) {
      throw new Error('Video is not loaded');
    }

    let page: number;
    let size: number;

    if (parentId > 0 && parentLevel > 0) {
      const selectedCommentState = findCommentRecursively(getState().video.comment, parentId, parentLevel);

      if (selectedCommentState) {
        const { currentPage, size: currentSize } = selectedCommentState.children;
        [page, size] = [currentPage + 1, currentSize];
      } else {
        throw 'Unknown comment';
      }
    } else {
      const { currentPage, size: currentSize } = getState().video.comment;
      [page, size] = [currentPage + 1, currentSize];
    }

    const { ok, problem, data } = await commentResource.getAll(videoId, {
      page,
      size,
      parentId,
    });

    if (ok) {
      const userId: number | undefined = getState().user.data?.id;
      const paginatedData = data.data;
      const resultComments: CommentStateData[] = paginatedData.dataset.map((c) => {
        return {
          ...c,
          isOwned: userId > 0 && userId === c.userId,
          children: { total: c.childCount, currentPage: 0, size: DEFAULT_COMMENT_REPLY_FETCH_SIZE, dataset: [] },
        };
      });

      return { dataset: resultComments, total: paginatedData.totalRecords, page: paginatedData.current };
    }

    throw new Error(`Cannot get comments. Reason: ${problem}`);
  }
);

type AddCommentArgs = {
  content: string;
  level: number; // TODO: level can be inferred from its parent, so consider to omit this
  parentId?: number;
};

export const addComment = createAsyncThunk<CommentStateData, AddCommentArgs, BaseAsyncThunkConfig>(
  'video/addComment',
  async (args, { getState }) => {
    const videoId = getState().video.data.code;

    if (!videoId) {
      throw new Error('Video is not loaded');
    }

    const { ok, problem, data } = await commentResource.create({
      videoId: videoId,
      content: args.content,
      level: args.level,
      parentId: args.parentId,
    });

    if (ok) {
      const user = getState().user.data;

      return {
        ...data.data,
        name: user.name,
        avatar: user.avatar,
        isOwned: true,
        children: { total: 0, currentPage: 0, size: DEFAULT_COMMENT_REPLY_FETCH_SIZE, dataset: [] },
      };
    }

    throw new Error(`Cannot add comment. Reason: ${problem}`);
  }
);

type DeleteCommentArgsOutput = { id: number; level: number; parentId: number };
export const deleteComment = createAsyncThunk<DeleteCommentArgsOutput, DeleteCommentArgsOutput, BaseAsyncThunkConfig>(
  'video/deleteComment',
  async (args, { getState }) => {
    const videoId = getState().video.data.code;

    if (!videoId) {
      throw new Error('Video is not loaded');
    }

    const { ok, problem, data } = await commentResource.delete(args.id);

    if (ok) {
      return args;
    }

    throw new Error(`Cannot add comment. Reason: ${problem}`);
  }
);

export const handleReaction = createAsyncThunk<void, VideoReactionEnum, BaseAsyncThunkConfig>(
  'video/reaction',
  async (reaction, thunkAPI) => {
    const { dispatch, getState } = thunkAPI;
    const video = getState().video.data;
    const updateType =
      reaction === VideoReactionEnum.LIKE
        ? video.liked
          ? VideoUpdateType.CANCEL_LIKE
          : VideoUpdateType.LIKE
        : video.disliked
          ? VideoUpdateType.CANCEL_DISLIKE
          : VideoUpdateType.DISLIKE;

    const { ok, problem } = await videoResource.update(video.code, { updateType });

    if (!ok) {
      throw problem;
    }

    if (reaction == VideoReactionEnum.LIKE) {
      dispatch(videoSlice.actions.switchLikeState());

      if (video.disliked) dispatch(videoSlice.actions.switchDislikeState());
    }

    if (reaction == VideoReactionEnum.DISLIKE) {
      dispatch(videoSlice.actions.switchDislikeState());

      if (video.liked) dispatch(videoSlice.actions.switchLikeState());
    }
  }
);

const initialCommentState: CommentState = {
  status: CommentStateStatus.NONE,
  dataset: [],
  total: 0,
  currentPage: 0, // increased at every fetch (by calling getComments)
  size: DEFAULT_COMMENT_FETCH_SIZE,
};

const initialState: VideoState = {
  status: VideoStateStatus.NONE,
  data: {},
  comment: initialCommentState,
} as VideoState;

/**
 * Store video information for the `WatchVideo` page.
 */
const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearVideoState(state) {
      state.status = VideoStateStatus.NONE;
      state.data = {} as DetailVideoData;
    },
    switchLikeState(state) {
      state.data = {
        ...state.data,
        liked: !state.data.liked,
        likeCount: state.data.likeCount + (state.data.liked ? -1 : 1),
      };
    },
    switchDislikeState(state) {
      state.data = {
        ...state.data,
        disliked: !state.data.disliked,
        dislikeCount: state.data.dislikeCount + (state.data.disliked ? -1 : 1),
      };
    },
    clearComments(state) {
      state.comment = initialCommentState;
    },
    clearCommentStatus(state) {
      state.comment.status = CommentStateStatus.NONE;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getVideo.pending, (state) => {
      state.status = VideoStateStatus.IS_FETCHING;
    });
    builder.addCase(getVideo.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = VideoStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(getVideo.rejected, (state, action) => {
      state.status = VideoStateStatus.FETCHING_FAILED;
      state.problemMessage = 'Cannot fetch video';
    });

    builder.addCase(getComments.pending, (state) => {
      state.comment.status = CommentStateStatus.IS_FETCHING_COMMENT;
    });
    builder.addCase(getComments.fulfilled, (state, action) => {
      // if (action.payload.dataset.length == 0) return;
      console.log(action.payload);
      const parentId = action.payload.dataset?.[0].parentId;

      // If fetching replies of a comment
      if (parentId) {
        const parentLevel = action.payload.dataset[0].level - 1;
        const parentComment = findCommentRecursively(state.comment, parentId, parentLevel);

        if (parentComment?.children) {
          parentComment.childCount = action.payload.total;
          parentComment.children = {
            ...parentComment.children,
            total: action.payload.total,
            dataset: [...parentComment.children.dataset, ...action.payload.dataset],
            currentPage: action.payload.page,
          };
        }
      } else if (action.payload.page !== state.comment.currentPage) {
        // If fetching a first-level comment
        state.comment = {
          ...state.comment,
          dataset: [...state.comment.dataset, ...action.payload.dataset],
          currentPage: action.payload.page,
          total: action.payload.total,
        };
      }

      state.comment.status = CommentStateStatus.FETCHING_COMMENTS_SUCCEEDED;
    });
    builder.addCase(getComments.rejected, (state, action) => {
      state.comment.status = CommentStateStatus.FETCHING_COMMENTS_FAILED;
      state.problemMessage = "Cannot fetch video's comments";
    });

    builder.addCase(addComment.pending, (state) => {
      state.comment.status = CommentStateStatus.IS_POSTING_COMMENT;
    });
    builder.addCase(addComment.fulfilled, (state, action) => {
      const parentId = action.payload.parentId;

      // If replied to a comment
      if (parentId) {
        const parentLevel = action.payload.level - 1;
        const parentComment = findCommentRecursively(state.comment, parentId, parentLevel);

        if (parentComment) {
          state.data.commentCount += 1;
          parentComment.childCount += 1;
          parentComment.children = {
            ...parentComment.children,
            dataset: [action.payload, ...parentComment.children.dataset],
            total: parentComment.childCount,
          };
        }
      } else {
        // If created a first-level comment
        state.data.commentCount += 1;
        state.comment = {
          ...state.comment,
          dataset: [action.payload, ...state.comment.dataset],
          total: state.comment.total + 1,
        };
      }

      state.comment.status = CommentStateStatus.COMMENTING_SUCCEEDED;
    });
    builder.addCase(addComment.rejected, (state, action) => {
      state.comment.status = CommentStateStatus.COMMENTING_FAILED;
      state.problemMessage = 'Cannot post comment';
    });

    builder.addCase(deleteComment.pending, (state) => {
      state.comment.status = CommentStateStatus.IS_DELETING_COMMENT;
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const { id, parentId, level } = action.payload;

      if (parentId) {
        const parentComment = findCommentRecursively(state.comment, parentId, level - 1);

        state.data.commentCount -= 1;
        parentComment.childCount -= 1;
        parentComment.children.total = parentComment.childCount;
        const deletedIndex = parentComment.children.dataset.findIndex((c) => c.id === id);

        if (deletedIndex > -1) {
          parentComment.children.dataset.splice(deletedIndex, 1);
        }
      } else {
        const deletedIndex = state.comment.dataset.findIndex((v) => v.id === id);

        state.data.commentCount -= 1;
        state.comment.total -= 1;
        state.comment.dataset.splice(deletedIndex, 1);
      }

      state.comment.status = CommentStateStatus.DELETION_SUCCEEDED;
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      state.comment.status = CommentStateStatus.DELETION_FAILED;
      state.problemMessage = 'Cannot delete comment';
    });
  },
});

export const { clearVideoState, clearComments, clearCommentStatus } = videoSlice.actions;

export const videoSliceActions = {
  ...videoSlice.actions,
  getVideo,
  getComments,
  addComment,
  deleteComment,
  handleReaction,
};

export default videoSlice.reducer;
