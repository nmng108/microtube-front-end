import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import type { ExceptionResponse } from '@models/base.ts';
import type { PROBLEM_CODE } from 'apisauce';

const reduxStore = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type RootDispatch = typeof reduxStore.dispatch;
export type BaseAsyncThunkConfig = {
  state: RootState;
  dispatch: RootDispatch;
  rejectValue: {
    problem: PROBLEM_CODE;
    body?: ExceptionResponse;
  },
};
export default reduxStore;
