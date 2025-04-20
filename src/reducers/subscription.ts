import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ConciseVideoData, toDetailVideoData } from '@models/video.ts';
import { ChannelStateData, toChannelStateData } from '@models/channel.ts';
import channelResource from '@api/channelResource.ts';
import { videoResource } from '@api';
import { PagingRequest, PagingResponse } from '@models/base.ts';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

const getSubscriptionPageContents = createAsyncThunk<void, void, BaseAsyncThunkConfig>(
  'subscription/getContents',
  async (arg, { dispatch }) => {
    dispatch(getSubscribedChannels({}));
    dispatch(getSubscribedChannelVideos({}));
  },
);

const getSubscribedChannels = createAsyncThunk<PagingResponse<ChannelStateData>, PagingRequest, BaseAsyncThunkConfig>(
  'subscription/getChannels',
  async (arg, { rejectWithValue }) => {
    const { ok, problem, data } = await channelResource.getAll({ subscribed: true, page: 1, size: 5, ...arg });

    if (ok) {
      const pagingResponse = data.data;

      return { ...pagingResponse, dataset: data.data.dataset?.map(toChannelStateData) ?? [] };
    }

    return rejectWithValue({ problem, body: (data.status === -1) ? data : null });
  },
);

const getSubscribedChannelVideos = createAsyncThunk<PagingResponse<ConciseVideoData>, PagingRequest, BaseAsyncThunkConfig>(
  'subscription/getVideos',
  async (arg, { rejectWithValue }) => {
    const { ok, problem, data } = await videoResource.getAll({ subscribed: true, page: 1, size: 20, ...arg });

    if (ok) {
      const pagingResponse = data.data;

      return { ...pagingResponse, dataset: pagingResponse.dataset?.map(toDetailVideoData) ?? [] };
    }

    return rejectWithValue({ problem, body: (data.status === -1) ? data : null });
  },
);

const changeSubscriptionState = createAsyncThunk<number, number, BaseAsyncThunkConfig>(
  'subscription/changeSubscriptionState',
  async (id, { getState, rejectWithValue }) => {
    const { subscribed } = getState().searchResult.channel.dataset.find((c) => c.id == id);
    const { ok, problem, data } = await channelResource.changeSubscriptionState(id, !subscribed);

    if (ok) return id;

    return rejectWithValue({ problem, body: (data.status === -1) ? data : null });
  },
);

export enum SubscriptionPageStatus {
  NONE,
  IS_FETCHING,
  FETCHING_DONE,
  FETCHING_FAILED,

  IS_SUBSCRIBING_TO_CHANNEL,
  SUBSCRIBING_SUCCEEDED,
  SUBSCRIBING_FAILED,
}

export interface SubscriptionPageState {
  channel: {
    status: SubscriptionPageStatus;
    problemMessage?: string;
    total: number;
    dataset: Array<ChannelStateData>;
  };
  video: {
    status: SubscriptionPageStatus;
    problemMessage?: string;
    total: number;
    dataset: Array<ConciseVideoData>;
  };
}

const initialState: SubscriptionPageState = {
  channel: {
    status: SubscriptionPageStatus.NONE,
    total: 0,
    dataset: [],
  },
  video: {
    status: SubscriptionPageStatus.NONE,
    total: 0,
    dataset: [],
  },
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSlice(state) {
      state = initialState; // may not work
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSubscribedChannels.pending, (state) => {
      state.channel.status = SubscriptionPageStatus.IS_FETCHING;
    });
    builder.addCase(getSubscribedChannels.fulfilled, (state, action) => {
      state.channel = {
        status: SubscriptionPageStatus.FETCHING_DONE,
        total: action.payload.totalRecords,
        dataset: action.payload.dataset,
      };
    });
    builder.addCase(getSubscribedChannels.rejected, (state, action) => {
      state.channel = {
        ...state.channel,
        status: SubscriptionPageStatus.FETCHING_FAILED,
        problemMessage: 'Cannot search for channel/video',
      };
    });

    builder.addCase(getSubscribedChannelVideos.pending, (state) => {
      state.video.status = SubscriptionPageStatus.IS_FETCHING;
    });
    builder.addCase(getSubscribedChannelVideos.fulfilled, (state, action) => {
      state.video = {
        status: SubscriptionPageStatus.FETCHING_DONE,
        total: action.payload.totalRecords,
        dataset: action.payload.dataset,
      };

    });
    builder.addCase(getSubscribedChannelVideos.rejected, (state, action) => {
      state.video = {
        ...state.video,
        status: SubscriptionPageStatus.FETCHING_FAILED,
        problemMessage: 'Cannot search for channel/video',
      };
    });

    builder.addCase(changeSubscriptionState.pending, (state) => {
      state.channel.status = SubscriptionPageStatus.IS_SUBSCRIBING_TO_CHANNEL;
    });
    builder.addCase(changeSubscriptionState.fulfilled, (state, action) => {
      const channel = state.channel.dataset.find((v) => v.id == action.payload);

      if (channel) {
        channel.subscriptionCount += channel.subscribed ? -1 : 1;
        channel.subscribed = !channel.subscribed;
      }

      state.channel.status = SubscriptionPageStatus.SUBSCRIBING_SUCCEEDED;
    });
    builder.addCase(changeSubscriptionState.rejected, (state, action) => {
      state.channel.status = SubscriptionPageStatus.SUBSCRIBING_FAILED;

      if (action.payload.body) {
        state.channel.problemMessage = action.payload.body.message;
      } else {
        console.error(`Error: ${action.payload.problem}`);
        state.channel.problemMessage = 'Unknown error occurred. Please try again.';
      }
    });
  },
});

export const subscriptionSliceActions = {
  ...subscriptionSlice.actions,
  getSubscribedChannels,
  getSubscriptionPageContents,
  changeSubscriptionState,
};

export default subscriptionSlice.reducer;
