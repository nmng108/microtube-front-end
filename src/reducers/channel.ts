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
  async (id: number | string, { getState, dispatch }): Promise<ChannelStateData> => {
    const { ok, problem, data } = await channelResource.get(id);

    if (ok) {
      const newChannelState = toChannelStateData(data.data);
      newChannelState.isOwned = newChannelState.userId === getState().user.data.id;

      dispatch(fetchChannelVideos(newChannelState.id));

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
  }
);

export const updateChannel = createAsyncThunk<ChannelStateData, UpdateChannelDTO, BaseAsyncThunkConfig>(
  'channel/update',
  async (requestBody: UpdateChannelDTO, { getState }): Promise<ChannelStateData> => {
    const channel = getState().channel.data;
    const { ok, problem, data } = await channelResource.update(channel.id, requestBody);

    if (ok && data.status == 0) {
      // update API should respond the entity info as detail as the get API does
      const responseDTO = data.data;

      return {
        ...channel,
        name: responseDTO.name,
        pathname: responseDTO.pathname,
        description: responseDTO.description,
      };
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
  }
);

export const uploadChannelAvatar = createAsyncThunk<string, File, BaseAsyncThunkConfig>(
  'channel/avatar/upload',
  async (file: File, thunk): Promise<string> => {
    const { getState } = thunk;
    const { ok, problem, data } = await uploadImmediate(file, (formData, config) => {
      return channelResource.uploadAvatar(getState().channel.data.id, formData, config);
    });

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
  }
);

export const fetchChannelVideos = createAsyncThunk<Array<ConciseVideoData>, number, BaseAsyncThunkConfig>(
  'channel/videos',
  async (channelId, { getState }) => {
    // if (!getState().channel.data?.id) {
    //   throw new Error('No channel selected');
    // }

    const { ok, problem, data } = await videoResource.getAll({ channelId: channelId });

    if (ok) return data.data.dataset?.map(toDetailVideoData);

    console.error(`Error fetching videos. Reason: ${problem}`);

    if (data.status === -1) {
      switch (data.errorCode) {
        case ServerErrorCode.INTERNAL_SERVER_ERROR:
          break;
      }
    } else {
      // When the exception is uncaught actively by server
    }

    throw problem;
  }
);

export const changeSubscriptionState = createAsyncThunk<void, void, BaseAsyncThunkConfig>(
  'channel/subscription',
  async (args, { getState, dispatch }) => {
    const channel = getState().channel.data;

    if (!channel?.id) {
      throw new Error('No channel selected');
    }

    const { ok, problem, data } = await channelResource.changeSubscriptionState(channel.id, !channel.subscribed);

    if (ok) {
      dispatch(channelSlice.actions.switchSubscriptionState());

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
  }
);

const initialState: ChannelState = {
  status: ChannelStateStatus.NONE,
  data: {} as ChannelStateData,
};

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    switchSubscriptionState(state) {
      state.data = {
        ...state.data,
        subscriptionCount: state.data.subscriptionCount + (state.data.subscribed ? -1 : 1),
        subscribed: !state.data.subscribed,
      };
    },
    clearChannel(state) {
      state = initialState;
      // state.status = initialState.status;
      // state.data = initialState.data;
    },
    clearStatus(state) {
      state.status = ChannelStateStatus.NONE;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getChannel.pending, (state) => {
      state.status = ChannelStateStatus.IS_FETCHING;
    });
    builder.addCase(getChannel.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ChannelStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(getChannel.rejected, (state, action) => {
      state.data = {} as ChannelStateData;
      state.status = ChannelStateStatus.FETCHING_FAILED;
      state.problemMessage = 'sth err';
    });

    builder.addCase(fetchChannelVideos.pending, (state) => {
      state.status = ChannelStateStatus.IS_FETCHING_VIDEOS;
    });
    builder.addCase(fetchChannelVideos.fulfilled, (state, action) => {
      state.data.videos = action.payload;
      state.status = ChannelStateStatus.FETCHING_VIDEOS_SUCCEEDED;
    });
    builder.addCase(fetchChannelVideos.rejected, (state, action) => {
      state.status = ChannelStateStatus.FETCHING_VIDEOS_FAILED;
      console.error("Error fetching channel's videos.", action);
      state.problemMessage = "Cannot fetch channel's videos";
    });

    builder.addCase(updateChannel.pending, (state) => {
      state.status = ChannelStateStatus.IS_UPDATING;
    });
    builder.addCase(updateChannel.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ChannelStateStatus.UPDATE_SUCCEEDED;
    });
    builder.addCase(updateChannel.rejected, (state, action) => {
      state.status = ChannelStateStatus.UPDATE_FAILED;
      console.error('Error updating channel info. ', action);
      state.problemMessage = 'sth err';
    });

    builder.addCase(uploadChannelAvatar.pending, (state) => {
      state.status = ChannelStateStatus.IS_UPLOADING;
      console.log('caught uploadChannelAvatar.pending');
    });
    builder.addCase(uploadChannelAvatar.fulfilled, (state, action) => {
      state.data.avatar = action.payload;
      state.status = ChannelStateStatus.UPLOAD_SUCCEEDED;
    });
    builder.addCase(uploadChannelAvatar.rejected, (state, action) => {
      state.status = ChannelStateStatus.UPLOAD_FAILED;
      console.error('Error uploading channel avatar.', action);
      state.problemMessage = 'sth err';
    });
  },
});

export const channelActions = channelSlice.actions;

export default channelSlice.reducer;
