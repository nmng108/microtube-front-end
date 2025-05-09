import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { StyledTrending } from '../Trending';
import Skeleton from '@skeletons/TrendingSkeleton';
import { clearHistoryState, deleteHistoryRecord, getHistory } from '@reducers';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { WatchHistoryState, WatchHistoryStateStatus } from '@models/watchHistory.ts';
import { IconButton } from '@mui/material';
import HistoryVideoCard from '@pages/watchhistory/HistoryVideoCard.tsx';

const WatchHistory = ({ nopad }) => {
  const dispatch = useDispatch<RootDispatch>();
  const { status, dataset } = useSelector<RootState, WatchHistoryState>((state) => state.history);

  const handleDelete = useCallback(
    (historyRecordId: number) => {
      dispatch(deleteHistoryRecord([historyRecordId]));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(getHistory());

    return () => {
      dispatch(clearHistoryState());
    };
  }, [dispatch]);

  if (status == WatchHistoryStateStatus.IS_FETCHING) {
    return <Skeleton />;
  }

  return (
    <StyledTrending nopad={nopad}>
      <h2>History</h2>

      {status == WatchHistoryStateStatus.FETCHING_SUCCEEDED && !dataset.length && (
        <p className="secondary">Videos that you have watched will show up here</p>
      )}

      {dataset.map((video) => (
        <Link key={video.historyRecordId} to={`/watch/${video.code}`} className="relative">
          {/*<div className="">*/}
          <HistoryVideoCard video={video} hidesDescription={true} />
          {/*</div>*/}
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(video.historyRecordId);
            }}
            aria-label="delete button"
            sx={{ color: 'white' }}
            className="absolute top-0 right-0"
          >
            <ClearRoundedIcon className="" />
          </IconButton>
        </Link>
      ))}
    </StyledTrending>
  );
};

export default WatchHistory;
