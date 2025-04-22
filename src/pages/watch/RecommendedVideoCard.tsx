import React, { useCallback } from 'react';
import styled from 'styled-components';
import { timeSince } from '@utils';
import { ConciseVideoData, VideoStatusEnum } from '@models/video.ts';
import Avatar from '@styles/Avatar.tsx';
import defaultAvatar from '@assets/default-avatar.svg';
import { useNavigate } from 'react-router';
import { ROUTES } from '@constants';

const Wrapper = styled.div`
    display: flex;
    margin: 1.4rem 0;
    margin-top: 1rem;
    justify-content: space-between;

    .thumb {
        align-items: center;
        width: 35%;
        aspect-ratio: 16/9;
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    .video-info-container {
        width: 63%;
    }

    p {
        font-size: 0.9rem;
    }

    p:last-child {
        margin-top: 0.2rem;
    }

    p span {
        padding-right: 0.3rem;
    }

    @media screen and (max-width: 750px) {
        margin: 1.2rem 0;

        .video-info-container {
            margin-left: 1.5rem;
        }
    }

    @media screen and (max-width: 645px) {
        flex-direction: column;

        .video-info-container {
            padding-bottom: 1rem;
        }

        .thumb {
            width: 100%;
            height: 300px;
        }

        .video-info-container {
            margin-left: 0;
            margin-top: 1rem;
        }
    }

    @media screen and (max-width: 530px) {
        .thumb {
            width: 100%;
            height: 250px;
        }
    }

    @media screen and (max-width: 420px) {
        .thumb {
            width: 100%;
            height: 200px;
        }
    }
`;

type Props = {
  video: ConciseVideoData;
  hidesAvatar?: boolean;
  hidesChannelName?: boolean;
  hidesDescription?: boolean;
}

const RecommendedVideoCard: React.FC<Props> = ({ video, hidesAvatar, hidesChannelName, hidesDescription }) => {
  const navigate = useNavigate();

  const openChannel = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`${ROUTES.CHANNEL}/${video.channelPathname}`);
  }, [navigate, video.channelPathname]);

  return (
    <Wrapper>
      <div className="thumb flex bg-neutral-900">
        {video.thumbnail && (
          <img src={video.thumbnail} alt="thumbnail"
               className="w-auto h-auto max-w-full max-h-full rounded-md mx-auto my-auto" />
        )}
      </div>
      <div className="video-info-container space-y-1">
        <h4 className="text-sm">{(video.title?.length > 40) ? video.title.substring(0, 40) + '...' : video.title}</h4>
        <div onClick={openChannel} className="flex items-center space-x-2 text-sm">
          {!hidesAvatar && (
            <Avatar
              src={video.channelAvatar || defaultAvatar}
              alt="Channel avatar"
            />
          )}
          {!hidesChannelName && (
            <span className="secondary hover:text-gray-200" style={{fontSize: '0.8rem'}}>{video.channelName}</span>
          )}
        </div>
        <p className="secondary" style={{fontSize: '0.8rem'}}>
          <span>{(video.status == VideoStatusEnum.READY) ? `${video.viewCount || 0} views` : `Being processed`}</span>
          <span>•&nbsp;{timeSince(video.createdAt)} ago</span>
        </p>
        {/*{!hidesDescription && (*/}
        {/*  <p className="secondary text-sm" dangerouslySetInnerHTML={{ __html: video.description }}></p>*/}
        {/*)}*/}
      </div>
    </Wrapper>
  );
};

export default RecommendedVideoCard;
