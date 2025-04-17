import React from 'react';
import styled from 'styled-components';
import Avatar from '../styles/Avatar';
import { timeSince } from '@utils';
import type { ConciseVideoData } from '../models/video.ts';
import defaultAvatar from '@assets/default-avatar.svg';

const Wrapper = styled.div`
    .thumb {
        width: 100%;
        height: 180px;
        object-fit: cover;
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    .video-info-container {
        display: flex;
        margin-top: 0.3rem;
    }

    .channel-avatar img {
        position: relative;
        top: 5px;
    }

    .video-info span {
        font-size: 0.9rem;
        padding-right: 0.1rem;
    }

    @media screen and (max-width: 600px) {
        .thumb {
            height: 250px;
        }
    }

    @media screen and (max-width: 420px) {
        .thumb {
            height: 200px;
        }
    }
`;

type Props = {
  video: ConciseVideoData;
  nousername?: boolean;
  hideavatar?: boolean;
}

const VideoCard: React.FC<Props> = ({ nousername, hideavatar, video }) => {
  return (
    <Wrapper>
      {video.thumbnail ? (<img className="thumb" src={video.thumbnail} alt="Video thumbnail" />) : <div className="thumb"></div>}
      <div className="video-info-container">
        <div className="channel-avatar">
          {!hideavatar && (
            <Avatar
              style={{ marginRight: '0.8rem' }}
              src={video.channelAvatar || defaultAvatar}
              alt="Channel avatar"
            />
          )}
        </div>
        <div className="video-info">
          <h4>
            {video.title?.length > 40
              ? video.title.substring(0, 40) + '...'
              : video.title}
          </h4>
          {!nousername && (
            <span className="secondary">{video.channelName}</span>
          )}
          <p className="secondary">
            <span>{video.viewCount || 0} views</span> <span>•</span>{' '}
            <span>{timeSince(video.createdAt)} ago</span>
          </p>
        </div>
      </div>
    </Wrapper>
  );
};

export default VideoCard;
