import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';
import { LoginRequestBody, SignupRequestBody, toUserStateData, UserState, UserStateData } from '../models/authUser';
import { authResource, userResource } from '@api';
import { ServerErrorCode } from '@constants';
import { isNotBlank, isNotNumber } from '@utilities';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

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
    // const user = await loginOrSignup({ type: 'login', data: payload });
    const apiResponse = await authResource.login(payload);

    if (apiResponse.ok) {
      clearForm();
    } else if (isNotNumber(apiResponse.data.status)) {
      // If not a custom message returned by server (equivalent to 4xx or 5xx HTTP status code)
      throw apiResponse.originalError;
    }

    return apiResponse.data;
  },
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ payload, clearForm }: SignUpAndClearFormAction) => {
    // const user = await loginOrSignup({ type: 'signup', data: payload });
    const apiResponse = await authResource.signup(payload);

    if (apiResponse.ok) {
      clearForm();
    } else if (isNotNumber(apiResponse.data.status)) {
      // If not a custom message returned by server (equivalent to 4xx or 5xx HTTP status code)
      throw apiResponse.originalError;
    }

    return apiResponse.data;
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
  async (arg, thunkAPI) => {
    localStorage.removeItem('user');
    thunkAPI.dispatch(userSlice.actions.clear());
  },
);

const initialState: UserState = {
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
      updateUser(state, action) {
        state.data = {
          ...state.data,
          ...action.payload,
        };
      },
      clear(state) {
        state.data = {} as UserStateData;
        state.channels = [];
        state.problemMessage = undefined;
      },
      removeProblemMessage(state) {
        state.problemMessage = undefined;
      },
      setProblemMessage(state, action: { payload: string }) {
        state.problemMessage = action.payload;
      },
    },
    extraReducers:
      (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
          const responseBody = action.payload;

          if (responseBody.status === 0) {
            state.data.username = responseBody.data.username;
          } else {
            switch (responseBody.errorCode) {
              case ServerErrorCode.VALIDATION_ERROR || ServerErrorCode.DOMAIN_VALIDATION_ERROR:
                state.problemMessage = responseBody.message;
                break;
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
          state.problemMessage = 'Unexpected connection error. Try again later.';
        });
        builder.addCase(signup.fulfilled, (state, action) => {
          const responseBody = action.payload;

          if (responseBody.status === 0) {
            state.data.username = responseBody.data.username;
          } else {
            switch (responseBody.errorCode) {
              case ServerErrorCode.VALIDATION_ERROR || ServerErrorCode.DOMAIN_VALIDATION_ERROR:
                state.problemMessage = responseBody.message;
                // TODO: may show specific error for each field
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
        builder.addCase(signup.rejected, (state, action) => {
          console.error('Reject on signup. Action details: ', action);
          state.problemMessage = 'Unexpected connection error. Try again later.';
        });
        builder.addCase(getUserDetails.fulfilled, (state, action) => {
          state.data = action.payload;
        });
        builder.addCase(getUserDetails.rejected, (state, action) => {
          const error: SerializedError = action.error;
          console.error('Reject on fetching user details. Action: ', action);
        });
      },
  })
;

export const {
  addChannel,
  removeChannel,
  updateUser,
  removeProblemMessage,
} = userSlice.actions;

export default userSlice.reducer;
