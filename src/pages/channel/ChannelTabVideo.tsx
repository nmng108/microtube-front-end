import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import { Link } from "react-router";
import SquareVideoCard from "@components/SquareVideoCard.tsx";
import type { RootDispatch, RootState } from '@redux-store.ts';
import { ConciseVideoData } from '@models/video.ts';
import { fetchChannelVideos } from '@reducers';
import { ROUTES } from '@constants';

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
  // const dispatch = useDispatch<RootDispatch>();
  const videos = useSelector<RootState, Array<ConciseVideoData>>((state) => state.channel.data.videos);

  if (!videos?.length) {
    return <p>This channel hasn't posted any videos yet</p>;
  }

  return (
    <Wrapper>
      <div className="videos">
        {videos?.map((video) => (
          <Link to={`${ROUTES.WATCH}/${video.id}`} key={video.id}>
            <SquareVideoCard video={video} hidesAvatar={true} hidesChannelName={true} />
          </Link>
        ))}
      </div>
    </Wrapper>
  );
};

export default ChannelTabVideo;
