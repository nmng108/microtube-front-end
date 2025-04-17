import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import Suggestions from "../components/Suggestions";
import VideoCard from "../components/VideoCard";
import { StyledHome } from "./Home";
import VideoGrid from "../styles/VideoGrid";
import Skeleton from "../skeletons/HomeSkeleton";
import { getFeed } from '@reducers';
import type { RootDispatch } from '@redux-store.ts';

const Subscriptions = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { isFetching, videos } = useSelector((state) => state.feed);

  useEffect(() => {
    dispatch(getFeed());
  }, [dispatch]);

  if (isFetching) {
    return <Skeleton />;
  }

  if (!isFetching && !videos.length) {
    return <Suggestions />;
  }

  return (
    <StyledHome>
      <div style={{ marginTop: "1.5rem" }}></div>

      <VideoGrid>
        {!isFetching &&
          videos.map((video) => (
            <Link key={video.id} to={`/watch/${video.code}`}>
              <VideoCard hideavatar={true} video={video} />
            </Link>
          ))}
      </VideoGrid>
    </StyledHome>
  );
};

export default Subscriptions;
