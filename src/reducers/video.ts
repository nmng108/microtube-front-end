import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  type DetailVideoData,
  toDetailVideoData, VideoReactionEnum,
  type VideoState,
  VideoStateStatus,
  VideoUpdateType,
} from '../models/video';
import { videoResource } from '../api';
import { type BaseAsyncThunkConfig } from '@redux-store.ts';
import { CommentState, CommentStateData, CommentStateStatus } from '@models/comment.ts';
import commentResource from '@api/commentResource.ts';
import watchHistoryResource from '@api/watchHistoryResource.ts';

/**
 * Called inside the `WatchVideo` component to fetch detail info of the specified video.
 */
export const getVideo = createAsyncThunk<DetailVideoData, number | string, BaseAsyncThunkConfig>(
  'video/getVideo',
  async (videoId: number | string, thunkAPI) => {
    const { ok, problem, data } = await videoResource.get(videoId);

    if (ok) {
      const resultStateData: DetailVideoData = toDetailVideoData(data.data);
      const ownedChannelId: number | undefined = thunkAPI.getState().user.data?.ownedChannel?.id;

      if (ownedChannelId > 0) {
        resultStateData.isOwned = (ownedChannelId === data.data.channelId);
      }

      await watchHistoryResource.log({ videoId, pausePosition: 0 }); // TODO: find ways to frequently update pausePosition

      return resultStateData;
    }

    throw new Error(`Cannot fetch video. Reason: ${problem}`);
  },
);

type GetCommentsOutput = {
  dataset: CommentStateData[];
  total: number;
  page: number;
};

/**
 * Fetch next page with fixed page size.
 */
export const getComments = createAsyncThunk<GetCommentsOutput, Partial<{ parentId: number }>, BaseAsyncThunkConfig>(
  'video/getComments',
  async (args, thunkAPI) => {
    const videoId = thunkAPI.getState().video.data.code;

    if (!videoId) {
      throw new Error('Video is not loaded');
    }

    const { currentPage, size } = thunkAPI.getState().video.comment;
    const { ok, problem, data } = await commentResource.getAll(videoId, {
      page: currentPage,
      size,
      parentId: args.parentId,
    });

    if (ok) {
      const userId: number | undefined = thunkAPI.getState().user.data?.id;
      const paginatedData = data.data;
      const resultComments: CommentStateData[] = paginatedData.dataset.map((c) => {
        return { ...c, isOwned: (userId > 0) && (userId === c.userId), children: [] };
      });

      return { dataset: resultComments, total: paginatedData.totalRecords, page: paginatedData.current };
    }

    throw new Error(`Cannot get comments. Reason: ${problem}`);
  },
);

type AddCommentArgs = {
  content: string,
  level: number,
  parentId?: number,
};

export const addComment = createAsyncThunk<CommentStateData, AddCommentArgs, BaseAsyncThunkConfig>(
  'video/addComment',
  async (args, thunkAPI) => {
    const videoId = thunkAPI.getState().video.data.code;

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
      const user = thunkAPI.getState().user.data;

      return { ...data.data, name: user.name, avatar: user.avatar, isOwned: true, children: [] };
    }

    throw new Error(`Cannot add comment. Reason: ${problem}`);
  },
);

export const deleteComment = createAsyncThunk<number, number, BaseAsyncThunkConfig>(
  'video/deleteComment',
  async (id, thunkAPI) => {
    const videoId = thunkAPI.getState().video.data.code;

    if (!videoId) {
      throw new Error('Video is not loaded');
    }

    const { ok, problem, data } = await commentResource.delete(id);

    if (ok) {
      return id;
    }

    throw new Error(`Cannot add comment. Reason: ${problem}`);
  },
);

export const handleReaction = createAsyncThunk<void, VideoReactionEnum, BaseAsyncThunkConfig>(
  'video/reaction',
  async (reaction, thunkAPI) => {
    const { dispatch, getState } = thunkAPI;
    const video = getState().video.data;
    const updateType = reaction === VideoReactionEnum.LIKE
      ? (video.liked ? VideoUpdateType.CANCEL_LIKE : VideoUpdateType.LIKE)
      : (video.disliked ? VideoUpdateType.CANCEL_DISLIKE : VideoUpdateType.DISLIKE);

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
  },
);

const initialCommentState: CommentState = {
  status: CommentStateStatus.NONE,
  dataset: [],
  total: 0,
  currentPage: 0, // increased at every fetch (by calling getComments)
  size: 50,
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
    clearVideo(state) {
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
      if (action.payload.page !== state.comment.currentPage) {
        state.comment.dataset = [...state.comment.dataset, ...action.payload.dataset];
        state.comment.currentPage = action.payload.page;
      }

      state.comment.total = action.payload.total;
      state.comment.status = CommentStateStatus.FETCHING_COMMENTS_SUCCEEDED;
    });
    builder.addCase(getComments.rejected, (state, action) => {
      state.comment.status = CommentStateStatus.FETCHING_COMMENTS_FAILED;
      state.problemMessage = 'Cannot fetch video\'s comments';
    });

    builder.addCase(addComment.pending, (state) => {
      state.comment.status = CommentStateStatus.IS_POSTING_COMMENT;
    });
    builder.addCase(addComment.fulfilled, (state, action) => {
      state.comment.dataset = [action.payload, ...state.comment.dataset];
      state.comment.total += 1;
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
      const deletedIndex = state.comment.dataset.findIndex(v => v.id === action.payload);

      state.comment.dataset.splice(deletedIndex, 1);
      state.comment.total -= 1;
      state.comment.status = CommentStateStatus.DELETION_SUCCEEDED;
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      state.comment.status = CommentStateStatus.DELETION_FAILED;
      state.problemMessage = 'Cannot delete comment';
    });
  },
});

export const {
  clearVideo,
  clearComments,
  clearCommentStatus,
} = videoSlice.actions;

export default videoSlice.reducer;
