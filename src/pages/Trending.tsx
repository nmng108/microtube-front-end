import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Link } from "react-router";
import TrendingCard from "../components/TrendingCard";
import Skeleton from "../skeletons/TrendingSkeleton";
import { getTrending } from "../reducers/trending";
import type { RootDispatch, RootState } from '../redux-store.js';

type StyledTrending = {nopad?: boolean};

export const StyledTrending = styled.div<StyledTrending>`
  padding: 1rem 1.3rem;
  width: 85%;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 7rem;
  padding-bottom: ${(props) => (props.nopad ? "0.5rem" : "7rem")};

  @media screen and (max-width: 930px) {
    width: 95%;
  }

  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;

const Trending = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { isFetching, videos } = useSelector<RootState, unknown>((state) => state.trending);

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
              <TrendingCard video={video} />
            </Link>
          ))}
      </div>
    </StyledTrending>
  );
};

export default Trending;
