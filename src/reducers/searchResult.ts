import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { client } from '../utils';
import { ConciseVideoData, toDetailVideoData, VideoDTO } from '@models/video.ts';
import { ChannelDTO, ChannelStateData, toChannelStateData } from '@models/channel.ts';
import channelResource from '@api/channelResource.ts';
import { videoResource } from '@api';
import { BasePagingResponse, ExceptionResponse, PagingResponse } from '@models/base.ts';
import { ApiResponse } from 'apisauce';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

type GetSearchResultsOutput = {
  video: PagingResponse<ConciseVideoData>;
  channel: PagingResponse<ChannelStateData>;
}

export const getSearchResults = createAsyncThunk<GetSearchResultsOutput, string, BaseAsyncThunkConfig>(
  'searchResult',
  async (searchString, { getState }) => {
    const channelSearchPromise = channelResource.getAll({ name: searchString });
    const videoSearchPromise = videoResource.getAll({ name: searchString });
    const results = await Promise.allSettled([channelSearchPromise, videoSearchPromise]);

    const channelSearchResult = results.at(0);// as PromiseFulfilledResult<ApiResponse<BasePagingResponse<ChannelDTO> | ExceptionResponse>> | PromiseRejectedResult;
    const videoSearchResult = results.at(1);
    const searchResults: GetSearchResultsOutput = {} as GetSearchResultsOutput;

    if (channelSearchResult.status == 'fulfilled' && channelSearchResult.value.ok) {
      const resData = (channelSearchResult.value.data as BasePagingResponse<ChannelDTO>).data;

      searchResults.channel = {
        ...resData,
        dataset: resData.dataset?.map((c) => {
          const channelStateData = toChannelStateData(c);
          channelStateData.isOwned = (channelStateData.userId === getState().user.data.id);

          return channelStateData;
        }) ?? [],
      };
    }

    if (videoSearchResult.status == 'fulfilled' && videoSearchResult.value.ok) {
      const resData = (videoSearchResult.value.data as BasePagingResponse<VideoDTO>).data;

      searchResults.video = { ...resData, dataset: resData.dataset?.map(toDetailVideoData) ?? [] };
    }

    return searchResults;
  },
);

export const changeChannelSubscriptionStateInSearchResult = createAsyncThunk<number, number, BaseAsyncThunkConfig>(
  'searchResult/subscribe',
  async (id, { getState, rejectWithValue }) => {
    const { subscribed } = getState().searchResult.channel.dataset.find((c) => c.id == id);
    const { ok, problem, data } = await channelResource.changeSubscriptionState(id, !subscribed);

    if (ok) return id;

    return rejectWithValue({ problem, body: (data.status === -1) ? data : null });
  },
);

export enum SearchingStatus {
  NONE,
  IS_FETCHING,
  FETCHING_DONE,
  FETCHING_FAILED,

  IS_SUBSCRIBING_TO_CHANNEL,
  SUBSCRIBING_SUCCEEDED,
  SUBSCRIBING_FAILED,
}

export interface SearchResultState {
  status: SearchingStatus;
  problemMessage?: string;
  channel: {
    total: number;
    dataset: Array<ChannelStateData>;
  };
  video: {
    total: number;
    dataset: Array<ConciseVideoData>;
  };
}

const initialState: SearchResultState = {
  status: SearchingStatus.NONE,
  channel: {
    total: 0,
    dataset: [],
  },
  video: {
    total: 0,
    dataset: [],
  },
};

const searchResultSlice = createSlice({
  name: 'searchResult',
  initialState,
  reducers: {
    clearSearchResults(state) {
      state = initialState; // may not work
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSearchResults.pending, (state) => {
      state.status = SearchingStatus.IS_FETCHING;
    });
    builder.addCase(getSearchResults.fulfilled, (state, action) => {
      state.status = SearchingStatus.FETCHING_DONE;
      state.video = { total: action.payload.video.totalRecords, dataset: action.payload.video.dataset };
      state.channel = { total: action.payload.channel.totalRecords, dataset: action.payload.channel.dataset };
    });
    builder.addCase(getSearchResults.rejected, (state, action) => {
      state.status = SearchingStatus.FETCHING_FAILED;
      state.problemMessage = 'Cannot search for channel/video';
    });

    builder.addCase(changeChannelSubscriptionStateInSearchResult.pending, (state) => {
      state.status = SearchingStatus.IS_SUBSCRIBING_TO_CHANNEL;
    });
    builder.addCase(changeChannelSubscriptionStateInSearchResult.fulfilled, (state, action) => {
      const channel = state.channel.dataset.find((v) => v.id == action.payload);

      if (channel) {
        channel.subscriptionCount += channel.subscribed ? -1 : 1;
        channel.subscribed = !channel.subscribed;
      }

      state.status = SearchingStatus.SUBSCRIBING_SUCCEEDED;
    });
    builder.addCase(changeChannelSubscriptionStateInSearchResult.rejected, (state, action) => {
      state.status = SearchingStatus.SUBSCRIBING_FAILED;

      if (action.payload.body) {
        state.problemMessage = action.payload.body.message;
      } else {
        console.error(`Error: ${action.payload.problem}`);
        state.problemMessage = 'Unknown error occurred. Please try again.';
      }
    });
  },
});

export const {
  clearSearchResults,
} = searchResultSlice.actions;

export default searchResultSlice.reducer;
