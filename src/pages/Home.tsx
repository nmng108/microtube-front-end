import React, { MouseEvent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import VideoCard from '../components/VideoCard';
import Skeleton from '../skeletons/HomeSkeleton';
import VideoGrid from '../styles/VideoGrid';
import { getRecommendation } from '../reducers/recommendation';
import type { RootDispatch, RootState } from '../redux-store.ts';
import { ConciseVideoData, RecommendationListState, VideoStatusEnum } from '../models/video.ts';
import { toast } from 'react-toastify';

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

  const onClickVideo = useCallback((e: MouseEvent<HTMLAnchorElement>, video: ConciseVideoData) => {
    if (video.status != VideoStatusEnum.READY) {
      e.preventDefault();
      toast.info('Video is not ready, please wait & reopen later.');
    }
  }, []);
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
          videos.map((video) => (
            <Link key={video.id} to={`/watch/${video.code}`} onClick={(e) => onClickVideo(e, video)}>
              <VideoCard video={video} />
            </Link>
          ))}
      </VideoGrid>
    </StyledHome>
  );
};

export default Home;
