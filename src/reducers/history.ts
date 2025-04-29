import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import watchHistoryResource from '@api/watchHistoryResource.ts';
import {
  convertWatchHistoryDTOtoRecord,
  WatchHistoryRecord,
  WatchHistoryState,
  WatchHistoryStateStatus,
} from '@models/watchHistory.ts';
import { BaseAsyncThunkConfig } from '@redux-store.ts';

type GetHistoryOutput = {
  dataset: WatchHistoryRecord[];
  page: number;
};

export const getHistory = createAsyncThunk<GetHistoryOutput, void, BaseAsyncThunkConfig>(
  'history/getHistory',
  async (args, { getState }) => {
    const { page, size } = getState().history;
    const { ok, problem, data } = await watchHistoryResource.getAll({ page: page + 1, size });

    if (ok) {
      const resBody = data.data;

      return { dataset: resBody.dataset.map((dto) => convertWatchHistoryDTOtoRecord(dto)), page: resBody.current };
    }

    throw problem;
  }
);

export const deleteHistoryRecord = createAsyncThunk<number[], number[], BaseAsyncThunkConfig>(
  'history/delete',
  async (ids) => {
    const { ok, problem } = await watchHistoryResource.delete(ids);

    if (ok) {
      return ids;
    }

    throw problem;
  }
);

const initialState: WatchHistoryState = {
  status: WatchHistoryStateStatus.NONE,
  dataset: [],
  page: 0,
  size: 50,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    clearHistoryState(state) {
      state.status = WatchHistoryStateStatus.NONE;
      state.dataset = [];
      state.page = 0;
      state.size = 50;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHistory.pending, (state) => {
      state.status = WatchHistoryStateStatus.IS_FETCHING;
    });
    builder.addCase(getHistory.fulfilled, (state, action) => {
      if (state.page !== action.payload.page) {
        state.dataset = [...state.dataset, ...action.payload.dataset];
        state.page = action.payload.page;
      }

      state.status = WatchHistoryStateStatus.FETCHING_SUCCEEDED;
    });
    builder.addCase(getHistory.rejected, (state, action) => {
      state.status = WatchHistoryStateStatus.FETCHING_FAILED;
      state.problemMessage = 'Cannot fetch history';
    });

    builder.addCase(deleteHistoryRecord.pending, (state) => {
      state.status = WatchHistoryStateStatus.IS_DELETING;
    });
    builder.addCase(deleteHistoryRecord.fulfilled, (state, action) => {
      action.payload.forEach((id) => {
        const index = state.dataset.findIndex((v) => v.historyRecordId === id);

        if (index !== -1) {
          state.dataset.splice(index, 1);
        }
      });

      state.status = WatchHistoryStateStatus.DELETION_SUCCEEDED;
    });
    builder.addCase(deleteHistoryRecord.rejected, (state, action) => {
      state.status = WatchHistoryStateStatus.DELETION_FAILED;
      state.problemMessage = 'Cannot delete history record';
    });
  },
});

export const { clearHistoryState } = historySlice.actions;

export default historySlice.reducer;
