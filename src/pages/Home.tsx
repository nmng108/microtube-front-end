import React, { MouseEvent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import SquareVideoCard from '@components/SquareVideoCard.tsx';
import Skeleton from '../skeletons/HomeSkeleton';
import VideoGrid from '../styles/VideoGrid';
import { getRecommendation } from '../reducers/recommendation';
import type { RootDispatch, RootState } from '../redux-store.ts';
import { ConciseVideoData, RecommendationListState, VideoStatusEnum } from '../models/video.ts';
import { toast } from 'react-toastify';
import { UserStateData } from '@models/authUser.ts';

export const StyledHome = styled.div`
    padding: 1.3rem;
    width: 90%;
    margin: 0 auto;
    padding-bottom: 7rem;

    h2 {
        margin-bottom: 1rem;
    }

    @media screen and (max-width: 1093px) {
        width: 95%;
    }

    @media screen and (max-width: 1090px) {
        width: 99%;
    }

    @media screen and (max-width: 870px) {
        width: 90%;
    }

    @media screen and (max-width: 670px) {
        width: 99%;
    }

    @media screen and (max-width: 600px) {
        width: 90%;
    }

    @media screen and (max-width: 530px) {
        width: 100%;
    }
`;

const Home = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { isFetching, videos } = useSelector<RootState, RecommendationListState>((state) => state.recommendation);
  const user = useSelector<RootState, UserStateData>((state) => state.user.data);

  const onClickVideo = useCallback((e: MouseEvent<HTMLAnchorElement>, video: ConciseVideoData) => {
    if (video.status != VideoStatusEnum.READY && (!user.ownedChannel || user.ownedChannel.id !== video.channelId)) {
      // Prevent all except video's author
      e.preventDefault();
      toast.info('Video is not ready, please wait & reopen later.');
    }
  }, [user.ownedChannel]);
  useEffect(() => {
    dispatch(getRecommendation());
  }, [dispatch]);

  if (isFetching) {
    return <Skeleton title={true} />;
  }

  return (
    <StyledHome>
      <h2>Recommended</h2>

      <VideoGrid>
        {!isFetching &&
          videos?.map((video) => (
            <Link key={video.id} to={`/watch/${video.code}`} onClick={(e) => onClickVideo(e, video)}>
              <SquareVideoCard video={video} />
            </Link>
          ))}
      </VideoGrid>
    </StyledHome>
  );
};

export default Home;
