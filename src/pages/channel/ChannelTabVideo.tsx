import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import { Link } from "react-router";
import VideoCard from "@components/VideoCard";
import type { RootDispatch, RootState } from '@redux-store.ts';
import { ConciseVideoData } from '@models/video.ts';
import { fetchChannelVideos } from '@reducers';

const Wrapper = styled.div`
  .videos {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 2rem;
  }

  @media screen and (max-width: 830px) {
    .videos {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (max-width: 540px) {
    .videos {
      grid-template-columns: 1fr;
    }
  }
`;

const ChannelTabVideo = () => {
  const dispatch = useDispatch<RootDispatch>();
  const videos = useSelector<RootState, Array<ConciseVideoData>>((state) => state.channel.data.videos);

  useEffect(() => {
    dispatch(fetchChannelVideos());
  }, [dispatch]);

  if (!videos?.length) {
    return <p>This channel hasn't posted any videos yet</p>;
  }

  return (
    <Wrapper>
      <div className="videos">
        {videos?.map((video) => (
          <Link to={`/watch/${video.id}`} key={video.id}>
            <VideoCard nousername={true} hideavatar={true} video={video} />
          </Link>
        ))}
      </div>
    </Wrapper>
  );
};

export default ChannelTabVideo;
