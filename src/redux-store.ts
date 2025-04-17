import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const reduxStore = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type RootDispatch = typeof reduxStore.dispatch;
export type BaseAsyncThunkConfig = {
  state: RootState;
  dispatch: RootDispatch;
};
export default reduxStore;
