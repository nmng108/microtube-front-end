import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { client } from '../utils';
import { ConciseVideoData, toDetailVideoData, VideoDTO } from '@models/video.ts';
import { ChannelDTO, ChannelStateData, toChannelStateData } from '@models/channel.ts';
import channelResource from '@api/channelResource.ts';
import { videoResource } from '@api';
import { BasePagingResponse, ExceptionResponse, PagingResponse } from '@models/base.ts';
import { ApiResponse } from 'apisauce';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

type SearchResults = {
  video: PagingResponse<ConciseVideoData>;
  channel: PagingResponse<ChannelStateData>;
}

export const getSearchResults = createAsyncThunk<SearchResults, string, BaseAsyncThunkConfig>(
  'searchResult',
  async (searchString, thunkAPI) => {
    const { getState } = thunkAPI;
    const channelSearchPromise = channelResource.getAll({ name: searchString });
    const videoSearchPromise = videoResource.getAll({ name: searchString });
    const results = await Promise.allSettled([channelSearchPromise, videoSearchPromise]);

    const channelSearchResult = results.at(0);// as PromiseFulfilledResult<ApiResponse<BasePagingResponse<ChannelDTO> | ExceptionResponse>> | PromiseRejectedResult;
    const videoSearchResult = results.at(1);
    const searchResults: SearchResults = {} as SearchResults;

    if (channelSearchResult.status == 'fulfilled' && channelSearchResult.value.ok) {
      const resData = (channelSearchResult.value.data as BasePagingResponse<ChannelDTO>).data;

      searchResults.channel = {
        ...resData,
        dataset: resData.dataset?.map((c) => {
          const channelStateData = toChannelStateData(c);
          channelStateData.isOwned = (channelStateData.userId === getState().user.data.id);
          channelStateData.subscribed = false; // TODO: handle this case

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

export enum SearchingStatus {
  NONE,
  IS_FETCHING,
  FETCHING_DONE,
  FETCHING_FAILED,
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
    toggleSubscribeSearchResults(state, action) {
      // state.channels = state.channels.map((user) =>
      //   action.payload === user.id
      //     ? { ...user, isSubscribed: !user.isSubscribed }
      //     : user,
      // );
    },
    clearSearchResults(state) {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSearchResults.fulfilled, (state, action) => {
      state.status = SearchingStatus.FETCHING_DONE;
      state.video = { total: action.payload.video.totalRecords, dataset: action.payload.video.dataset };
      state.channel = { total: action.payload.channel.totalRecords, dataset: action.payload.channel.dataset };
    });
    builder.addCase(getSearchResults.rejected, (state, action) => {
      state.status = SearchingStatus.FETCHING_FAILED;
      state.problemMessage = 'Cannot search for channel/video';
    });
  },
});

export const {
  toggleSubscribeSearchResults,
  // unsubscribeFromSearchResults,
  clearSearchResults,
} = searchResultSlice.actions;

export default searchResultSlice.reducer;
