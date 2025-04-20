import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  LoginRequestBody,
  SignupRequestBody,
  toUserStateData,
  UpdateUserDTO,
  UserState,
  UserStateData,
  UserStateStatus,
} from '@models/authUser';
import { ChannelStateData, CreateChannelDTO, toChannelStateData } from '@models/channel.ts';
import { authResource, userResource, channelResource } from '@api';
import { ServerErrorCode } from '@constants';
import { isNotBlank, isNotNumber, uploadImmediate } from '@utilities';
import type { BaseAsyncThunkConfig } from '@redux-store.ts';

// TODO: change the async thunk flow to reduce unnecessary error-catching code

interface AuthenticateAndClearFormAction {
  payload: LoginRequestBody,
  clearForm: () => void;
}

interface SignUpAndClearFormAction {
  payload: SignupRequestBody;
  clearForm: () => void;
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ payload, clearForm }: AuthenticateAndClearFormAction) => {
    const { ok, problem, data } = await authResource.login(payload);

    if (ok) {
      clearForm();
    } else if (isNotNumber(data.status)) {
      // If not a custom message returned by server (equivalent to 4xx or 5xx HTTP status code)
      throw problem;
    }

    return data;
  },
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ payload, clearForm }: SignUpAndClearFormAction) => {
    const { ok, problem, data } = await authResource.signup(payload);

    if (ok) {
      clearForm();
    } else if (isNotNumber(data.status)) {
      // If not a custom message returned by server (equivalent to 4xx or 5xx HTTP status code)
      throw problem;
    }

    return data;
  },
);

/**
 * Require authentication token.
 */
export const getUserDetails = createAsyncThunk<UserStateData, void, BaseAsyncThunkConfig>(
  'user/details',
  async (args, thunkAPI) => userResource.getDetails().then((apiResponse) => {
    const { dispatch } = thunkAPI;
    const { ok, problem, data } = apiResponse;

    if (!ok) {
      const storedUserInfo: string = localStorage.getItem('user');
      const justLogin: boolean = storedUserInfo && isNotBlank(storedUserInfo);

      if (data.status == -1) {
        switch (data.errorCode) {
          case ServerErrorCode.AUTHENTICATION_FAILED: {
            localStorage.removeItem('user');
            dispatch(userSlice.actions.clear());
            dispatch(userSlice.actions.setProblemMessage('Logged out'));
            break;
          }
          case ServerErrorCode.INTERNAL_SERVER_ERROR: {
            if (justLogin) {
              localStorage.removeItem('user');
              dispatch(userSlice.actions.clear());
            }

            dispatch(userSlice.actions.setProblemMessage('Unexpected server error.'));
            break;
          }
          default: {
            if (justLogin) {
              localStorage.removeItem('user');
              dispatch(userSlice.actions.clear());
            }

            dispatch(userSlice.actions.setProblemMessage('Connection error.'));
            break;
          }
        }

        console.error(`Error fetching user info. Reason: ${problem}`);
        // action.error (on rejected) is of SerializableError
        // throw new HttpException(apiResponse.status, 'Logged out');
      }
      // TODO: handle exceptions where data.status == undefined

      throw problem;
    }

    const userStateData = toUserStateData(data.data);

    localStorage.setItem('user', JSON.stringify(userStateData));

    return userStateData;
  }),
);

// Dispatch directly the clear() action, so no reducer handles this action
export const logout = createAsyncThunk<void, void, BaseAsyncThunkConfig>(
  'user/logout',
  async () => {
    await authResource.logout();

    localStorage.removeItem('user');
    location.reload();
    // thunkAPI.dispatch(userSlice.actions.clear());
  },
);

export const updateUserInfo = createAsyncThunk<UserStateData, UpdateUserDTO, BaseAsyncThunkConfig>(
  'user/update',
  async (body: UpdateUserDTO, { rejectWithValue }) => {
    const updateResult = await userResource.selfUpdate(body);

    if (!updateResult.ok) {
      return rejectWithValue({
        problem: updateResult.problem,
        body: (updateResult.data.status === -1) ? updateResult.data : undefined,
      });
    }

    const userStateData = toUserStateData(updateResult.data.data);

    localStorage.setItem('user', JSON.stringify(userStateData));

    return userStateData;
  },
);

type CreateChannelData = CreateChannelDTO & {
  avatarFile?: File;
};

export const createChannel = createAsyncThunk<ChannelStateData, CreateChannelData, BaseAsyncThunkConfig>(
  'channel/create',
  async ({ avatarFile, ...body }, { dispatch, rejectWithValue }) => {
    const creationResult = await channelResource.create(body);

    if (!creationResult.ok) {
      return rejectWithValue({
        problem: creationResult.problem,
        body: (creationResult.data.status === -1) ? creationResult.data : undefined,
      });
    }

    if (avatarFile) {
      const channelId = creationResult.data.data.id;
      const uploadAvatarResult = await uploadImmediate(
        avatarFile,
        (formData, config) => channelResource.uploadAvatar(channelId, formData, config),
      );

      if (!uploadAvatarResult.ok) {
        dispatch(userSlice.actions.setProblemMessage('Cannot upload avatar. Try again later.'));
      }
    }

    return toChannelStateData(creationResult.data.data);
  },
);


const initialState: UserState = {
  status: UserStateStatus.NONE,
  data: JSON.parse(localStorage.getItem('user')) || {},
  channels: [],
};

/**
 * Manage currently logged-in user's state.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addChannel(state, action) {
      // state.channels = [action.payload, ...state.data.channels];
    },
    removeChannel(state, action) {
      state.data = {
        ...state.data,
        // subscribedChannels: state.data.channels.filter(
        //   (channel) => channel.id !== action.payload,
        // ),
      };
    },
    clear(state) {
      state.status = UserStateStatus.NONE;
      state.data = {} as UserStateData;
      state.channels = [];
      state.problemMessage = undefined;
    },
    clearUserStateStatusAndProblemMessage(state) {
      state.status = UserStateStatus.NONE;
      state.problemMessage = undefined;
    },
    setProblemMessage(state, action: { payload: string }) {
      state.problemMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.status = UserStateStatus.IS_LOGGING_IN;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      const responseBody = action.payload;

      if (responseBody.status === 0) {
        state.data.username = responseBody.data.username;
        state.status = UserStateStatus.LOGIN_SUCCEEDED;
      } else {
        state.status = UserStateStatus.LOGIN_FAILED;

        switch (responseBody.errorCode) {
          case ServerErrorCode.VALIDATION_ERROR:
          case ServerErrorCode.DOMAIN_VALIDATION_ERROR: {
            const firstDetailMessage = responseBody.details[0];

            if (typeof firstDetailMessage == 'string') {
              state.problemMessage = firstDetailMessage;
            } else if (firstDetailMessage.field && firstDetailMessage.message) {
              state.problemMessage = `${firstDetailMessage.field} ${firstDetailMessage.message}`;
            }

            break;
          }
          case ServerErrorCode.AUTHENTICATION_FAILED:
            state.problemMessage = 'Invalid credentials.';
            break;
          case ServerErrorCode.INTERNAL_SERVER_ERROR:
            state.problemMessage = 'Unexpected server error. Try again later.';
            break;
          default:
            state.problemMessage = 'Connection error.';
            break;
        }
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      console.error('Reject on login. Action details: ', action);
      state.status = UserStateStatus.LOGIN_FAILED;
      state.problemMessage = 'Unexpected connection error. Try again later.';
    });

    builder.addCase(signup.pending, (state) => {
      state.status = UserStateStatus.IS_SIGNING_UP;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      const responseBody = action.payload;

      if (responseBody.status === 0) {
        state.data.username = responseBody.data.username;
        state.status = UserStateStatus.SIGNUP_SUCCEEDED;
      } else {
        state.status = UserStateStatus.SIGNUP_FAILED;

        switch (responseBody.errorCode) {
          case ServerErrorCode.VALIDATION_ERROR:
          case ServerErrorCode.DOMAIN_VALIDATION_ERROR: {
            const firstDetailMessage = responseBody.details[0];

            if (typeof firstDetailMessage == 'string') {
              state.problemMessage = firstDetailMessage;
            } else if (firstDetailMessage.field && firstDetailMessage.message) {
              state.problemMessage = `${firstDetailMessage.field} ${firstDetailMessage.message}`;
            }

            break;
          }
          case ServerErrorCode.INTERNAL_SERVER_ERROR:
            state.problemMessage = 'Unexpected server error. Try again later.';
            break;
          default:
            state.problemMessage = 'Connection error.';
            break;
        }
      }
    });
    builder.addCase(signup.rejected, (state, action) => {
      console.error('Reject on signup. Action details: ', action);
      state.status = UserStateStatus.SIGNUP_FAILED;
      state.problemMessage = 'Unexpected connection error. Try again later.';
    });

    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = UserStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(getUserDetails.rejected, (state, action) => {
      state.status = UserStateStatus.FETCHING_FAILED;
      console.error('Reject on fetching user details. Action: ', action);
    });

    builder.addCase(updateUserInfo.pending, (state) => {
      state.status = UserStateStatus.IS_UPDATING_USER;
    });
    builder.addCase(updateUserInfo.fulfilled, (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.status = UserStateStatus.USER_UPDATED;
    });
    builder.addCase(updateUserInfo.rejected, (state, action) => {
      state.status = UserStateStatus.USER_NOT_UPDATED;
      const { problem, body } = action.payload;

      if (body) {
        if (body.details?.length > 0) {
          const firstDetailMessage = body.details[0];

          if (typeof firstDetailMessage == 'string') {
            state.problemMessage = firstDetailMessage;
          } else {
            state.problemMessage = `${firstDetailMessage.field} ${firstDetailMessage.message}`;
          }
        } else {
          state.problemMessage = body.message;
        }
      } else {
        switch (problem) {
          case 'SERVER_ERROR':
            state.problemMessage = 'Server error. Try again later.';
            break;
          default:
            state.problemMessage = 'Connection error';
            break;
        }
      }
    });

    builder.addCase(createChannel.pending, (state) => {
      state.status = UserStateStatus.IS_CREATING_CHANNEL;
    });
    builder.addCase(createChannel.fulfilled, (state, action) => {
      state.data.ownedChannel = action.payload;
      state.status = UserStateStatus.CHANNEL_CREATED;
    });
    builder.addCase(createChannel.rejected, (state, action) => {
      state.status = UserStateStatus.CHANNEL_NOT_CREATED;
      const { problem, body } = action.payload;

      if (body) {
        if (body.details?.length > 0) {
          const firstDetailMessage = body.details[0];

          if (typeof firstDetailMessage == 'string') {
            state.problemMessage = firstDetailMessage;
          } else {
            state.problemMessage = `${firstDetailMessage.field} ${firstDetailMessage.message}`;
          }
        } else {
          state.problemMessage = body.message;
        }
      } else {
        switch (problem) {
          case 'SERVER_ERROR':
            state.problemMessage = 'Server error. Try again later.';
            break;
          default:
            state.problemMessage = 'Connection error';
            break;
        }
      }
    });
  },
});

export const {
  addChannel,
  removeChannel,
  clearUserStateStatusAndProblemMessage,
} = userSlice.actions;

export default userSlice.reducer;
