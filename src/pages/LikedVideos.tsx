import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import TrendingCard from '../components/TrendingCard';
import { StyledTrending } from './Trending';
import Skeleton from '../skeletons/TrendingSkeleton';
import { clearLikedVideoListState, getLikedVideos } from '@reducers/likedVideos';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { LikedVideoListState, VideoListStateStatus } from '@models/video.ts';

const LikedVideos = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { status, dataset } = useSelector<RootState, LikedVideoListState>((state) => state.likedVideos);

  useEffect(() => {
    dispatch(getLikedVideos());

    return () => {
      dispatch(clearLikedVideoListState());
    }
  }, [dispatch]);

  if (status == VideoListStateStatus.IS_FETCHING) {
    return <Skeleton />;
  }

  return (
    <StyledTrending>
      <h2>Liked Videos</h2>

      {dataset?.length === 0 && (
        <p className="secondary">
          Videos that you have liked will show up here
        </p>
      )}

      {dataset?.map((video) => (
        <Link key={video.id} to={`/watch/${video.code}`}>
          <TrendingCard video={video} />
        </Link>
      ))}
    </StyledTrending>
  );
};

export default LikedVideos;
