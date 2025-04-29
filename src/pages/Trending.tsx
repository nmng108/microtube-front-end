import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import RectangleVideoCard from '@components/RectangleVideoCard.tsx';
import Skeleton from '../skeletons/TrendingSkeleton';
import { getTrending } from '../reducers/trending';
import type { RootDispatch, RootState } from '../redux-store.js';
import { RecommendationListState } from '@models/video.ts';

type StyledTrending = { nopad?: boolean };

export const StyledTrending = styled.div<StyledTrending>`
  width: 100%;
  padding: 2rem 1.3rem ${(props) => (props.nopad ? '0.5rem' : '7rem')} 1.3rem;
  margin: 0 auto;

  @media screen and (max-width: 48rem) {
    width: 95%;
  }

  @media screen and (min-width: 96rem) {
    width: 100%;
    max-width: 70rem;
    margin: 0 0 0 10rem;
  }
`;

const Trending = () => {
  const dispatch = useDispatch<RootDispatch>();
  // const { isFetching, videos } = useSelector<RootState, unknown>((state) => state.trending);
  const { isFetching, videos } = useSelector<RootState, RecommendationListState>((state) => state.recommendation);

  useEffect(() => {
    dispatch(getTrending());
  }, [dispatch]);

  if (isFetching) {
    return <Skeleton />;
  }

  return (
    <StyledTrending>
      <h2>Trending</h2>

      <div className="trending">
        {!isFetching &&
          videos.map((video) => (
            <Link to={`/watch/${video.id}`} key={video.code}>
              <RectangleVideoCard video={video} />
            </Link>
          ))}
      </div>
    </StyledTrending>
  );
};

export default Trending;
