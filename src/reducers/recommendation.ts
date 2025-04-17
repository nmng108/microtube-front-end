import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ConciseVideoData, RecommendationListState, toDetailVideoData } from '../models/video.ts';
import videoResource from '../api/videoResource.ts';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

export const getRecommendation = createAsyncThunk<Array<ConciseVideoData>, void, BaseAsyncThunkConfig>(
  'recommendation/getRecommendation',
  async (args, thunkAPI) => {
    const { ok, problem, data } = await videoResource.getAll();

    if (!ok) {
      throw new Error(`Could not get recommendations. Reason: ${problem}`);
    }

    const channelId: number | undefined = thunkAPI.getState().user.data?.ownedChannel?.id;

    return data.data.dataset?.map(toDetailVideoData).map((v) => {
      v.isOwned = (v.channelId === channelId);

      return v;
    });
  },
);

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState: {
    isFetching: true,
    videos: [],
  } as RecommendationListState,
  reducers: {
    addToRecommendation(state, action) {
      state.videos = [action.payload, ...state.videos];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRecommendation.fulfilled, (state, action) => {
      state.isFetching = false;
      state.videos = action.payload;
    });
  },
});

export const { addToRecommendation } = recommendationSlice.actions;

export default recommendationSlice.reducer;
