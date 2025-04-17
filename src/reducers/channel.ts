import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ChannelState,
  ChannelStateData,
  ChannelStateStatus,
  toChannelStateData,
  UpdateChannelDTO,
} from '@models/channel.ts';
import channelResource from '@api/channelResource.ts';
import { uploadImmediate } from '@utilities';
import { ServerErrorCode } from '@constants';
import { BaseAsyncThunkConfig } from '@redux-store.ts';
import { ConciseVideoData, toDetailVideoData } from '@models/video.ts';
import { videoResource } from '@api';

// TODO: fill appropriate code in exceptional cases

export const getChannel = createAsyncThunk<ChannelStateData, number | string, BaseAsyncThunkConfig>(
  'channel/getById',
  async (id: number | string, thunk): Promise<ChannelStateData> => {
    const { getState } = thunk;
    const { ok, problem, data } = await channelResource.get(id);

    if (ok) {
      const newChannelState = toChannelStateData(data.data);
      newChannelState.isOwned = (newChannelState.userId === getState().user.data.id);

      return newChannelState;
    }

    console.error(`Error fetching channel info. Reason: ${problem}`);

    if (data.status === -1) {
      switch (data.errorCode) {
        case ServerErrorCode.INTERNAL_SERVER_ERROR:
          break;
      }
    } else {
      // When the exception is uncaught actively by server
    }

    throw problem;
  },
);

export const updateChannel = createAsyncThunk<ChannelStateData, UpdateChannelDTO, BaseAsyncThunkConfig>(
  'channel/update',
  async (requestBody: UpdateChannelDTO, thunk): Promise<ChannelStateData> => {
    const { getState } = thunk;
    const { ok, problem, data } = await channelResource.update(getState().channel.data.id, requestBody);

    if (ok && data.status == 0) {
      // update API should respond the entity info as detail as the get API does
      const updatedChannelState = toChannelStateData(data.data);
      updatedChannelState.isOwned = (updatedChannelState.userId === getState().user.data.id);

      return updatedChannelState;
    }

    console.error(`Error update channel. Reason: ${problem}`);

    if (data.status === -1) {
      switch (data.errorCode) {
        case ServerErrorCode.VALIDATION_ERROR:
          break;
        case ServerErrorCode.INTERNAL_SERVER_ERROR:
          break;
      }
    } else {
      // When the exception is uncaught actively by server
    }

    throw problem;
  },
);

export const uploadChannelAvatar = createAsyncThunk<string, File, BaseAsyncThunkConfig>(
  'channel/avatar/upload',
  async (file: File, thunk): Promise<string> => {
    const { getState } = thunk;
    const { ok, problem, data } = await uploadImmediate(
      file,
      (formData, config) => {
        return channelResource.uploadAvatar(getState().channel.data.id, formData, config);
      },
    );

    if (ok) return data.data;

    console.error(`Error uploading channel avatar. Reason: ${problem}`);

    if (data.status === -1) {
      switch (data.errorCode) {
        case ServerErrorCode.VALIDATION_ERROR:
          break;
        case ServerErrorCode.INTERNAL_SERVER_ERROR:
          break;
      }
    } else {
      // When the exception is uncaught actively by server
    }

    throw problem;
  },
);

export const fetchChannelVideos = createAsyncThunk<Array<ConciseVideoData>, void, BaseAsyncThunkConfig>(
  'channel/videos',
  async (args, thunkAPI) => {
    const { getState } = thunkAPI;

    if (!getState().channel.data?.id) {
      throw new Error('No channel selected');
    }

    const { ok, problem, data } = await videoResource.getAll({channelId: getState().channel.data.id});

    if (ok) return data.data.dataset.map(toDetailVideoData);

    console.error(`Error uploading channel avatar. Reason: ${problem}`);

    if (data.status === -1) {
      switch (data.errorCode) {
        case ServerErrorCode.INTERNAL_SERVER_ERROR:
          break;
      }
    } else {
      // When the exception is uncaught actively by server
    }

    throw problem;
  },
);

export const changeSubscriptionState = createAsyncThunk<void, void, BaseAsyncThunkConfig>(
  'channel/subscription',
  async (args, thunkAPI) => {
    const channel = thunkAPI.getState().channel.data;

    if (!channel?.id) {
      throw new Error('No channel selected');
    }

    const { ok, problem, data } = await channelResource.changeSubscriptionState(channel.id, !channel.subscribed);

    if (ok) {
      thunkAPI.dispatch(channel.subscribed
        ? channelSlice.actions.removeSubscription()
        : channelSlice.actions.addSubscription());

      return;
    }

    console.error(`Error updating channel subscription. Reason: ${problem}`);

    if (data.status === -1) {
      switch (data.errorCode) {
        case ServerErrorCode.INTERNAL_SERVER_ERROR:
          break;
      }
    } else {
      // When the exception is uncaught actively by server
    }

    throw problem;
  },
);

const initialState: ChannelState = {
  status: ChannelStateStatus.NONE,
  data: {} as ChannelStateData,
};

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    clearChannel(state) {
      state = initialState;
      // state.status = initialState.status;
      // state.data = initialState.data;
    },
    addSubscription(state) {
      state.data = {
        ...state.data,
        subscriptionCount: state.data.subscriptionCount + 1,
        subscribed: !state.data.subscribed,
      };
    },
    removeSubscription(state) {
      state.data = {
        ...state.data,
        subscriptionCount: state.data.subscriptionCount - 1,
        subscribed: !state.data.subscribed,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getChannel.pending, (state) => {
      state.status = ChannelStateStatus.IS_FETCHING;
      console.log('caught getChannel.pending; change status');
    });
    builder.addCase(getChannel.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ChannelStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(getChannel.rejected, (state, action) => {
      state.data = {} as ChannelStateData;
      state.status = ChannelStateStatus.FETCHING_FAILED;
      state.problemMessage = 'sth err'
    });

    builder.addCase(updateChannel.pending, (state) => {
      state.status = ChannelStateStatus.IS_UPDATING;
      console.info('caught channel.pending');
    });
    builder.addCase(updateChannel.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ChannelStateStatus.UPDATE_SUCCEEDED;
    });
    builder.addCase(updateChannel.rejected, (state, action) => {
      state.status = ChannelStateStatus.UPDATE_FAILED;
      console.error('Error updating channel info. ', action);
      state.problemMessage = 'sth err'
    });

    builder.addCase(uploadChannelAvatar.pending, (state) => {
      state.status = ChannelStateStatus.IS_UPDATING;
      console.log('caught uploadChannelAvatar.pending');
    });
    builder.addCase(uploadChannelAvatar.fulfilled, (state, action) => {
      state.data.avatar = action.payload;
      state.status = ChannelStateStatus.UPDATE_SUCCEEDED;
    });
    builder.addCase(uploadChannelAvatar.rejected, (state, action) => {
      state.status = ChannelStateStatus.UPDATE_FAILED;
      console.error('Error uploading channel avatar.', action);
      state.problemMessage = 'sth err'
    });
    builder.addCase(fetchChannelVideos.fulfilled, (state, action) => {
      state.data.videos = action.payload;
      state.status = ChannelStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(fetchChannelVideos.rejected, (state, action) => {
      state.status = ChannelStateStatus.FETCHING_FAILED;
      console.error("Error fetching channel's videos.", action);
      state.problemMessage = "Cannot fetch channel's videos";
    });
  },
});

const {
  clearChannel,
  addSubscription,
  removeSubscription,
} = channelSlice.actions;

export {
  clearChannel,
  addSubscription,
  removeSubscription,
};

export default channelSlice.reducer;
