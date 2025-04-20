import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { videoResource } from '@api';
import {
  ConciseVideoData,
  LikedVideoListState,
  toDetailVideoData,
  VideoListStateStatus,
  VideoReactionEnum,
} from '@models/video.ts';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

export const getLikedVideos = createAsyncThunk<Array<ConciseVideoData>, void, BaseAsyncThunkConfig>(
  'likedVideos/get',
  async (args, { getState }) => {
    const { ok, problem, data } = await videoResource.getAll({ reaction: VideoReactionEnum.LIKE });

    if (!ok) {
      throw new Error(`Could not get recommendations. Reason: ${problem}`);
    }

    const channelId: number | undefined = getState().user.data?.ownedChannel?.id;

    return data.data.dataset?.map(toDetailVideoData).map((v) => {
      v.isOwned = (v.channelId === channelId);

      return v;
    });
  },
);

const initialState: LikedVideoListState = {
  status: VideoListStateStatus.NONE,
  dataset: [],
};

const likedVideoSlice = createSlice({
  name: 'likedVideos',
  initialState,
  reducers: {
    clearLikedVideoListState(state) {
      state.status = VideoListStateStatus.NONE;
      state.dataset = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getLikedVideos.pending, (state) => {
      state.status = VideoListStateStatus.IS_FETCHING;
    });
    builder.addCase(getLikedVideos.fulfilled, (state, action) => {
      state.dataset = action.payload;
      state.status = VideoListStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(getLikedVideos.rejected, (state, action) => {
      state.status = VideoListStateStatus.FETCHING_SUCCEEDED;
      state.problemMessage = 'Cannot fetch video list.';
    });
  },
});

export const {
  clearLikedVideoListState,
} = likedVideoSlice.actions;

export default likedVideoSlice.reducer;
