import React, { useCallback } from 'react';
import styled from 'styled-components';
import Avatar from '../styles/Avatar';
import { timeSince } from '@utils';
import { ConciseVideoData, VideoStatusEnum } from '../models/video.ts';
import defaultAvatar from '@assets/default-avatar.svg';
import { ROUTES } from '@constants';
import { useNavigate } from 'react-router';

const Wrapper = styled.div`
    //display: flex;
    //flex-direction: column;
    //justify-content: space-between;

    .thumb {
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: cover;
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
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
  hidesAvatar?: boolean;
  hidesChannelName?: boolean;
}

const SquareVideoCard: React.FC<Props> = ({ video, hidesAvatar, hidesChannelName }) => {
  const navigate = useNavigate();

  const openChannel = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`${ROUTES.CHANNEL}/${video.channelPathname}`);
  }, [navigate, video.channelPathname]);

  return (
    <Wrapper className="space-y-2">
      <div className="thumb flex items-center justify-center bg-neutral-900">
        {video.thumbnail && (
          <img src={video.thumbnail} alt="thumbnail" className="w-auto h-auto max-w-full max-h-full rounded-md" />
        )}
      </div>
      <div className="flex mx-2 space-x-2 justify-between">
        <div className="w-[10%] mt-1">
          {!hidesAvatar && (
            <Avatar
              src={video.channelAvatar || defaultAvatar}
              alt="Channel avatar"
              onClick={openChannel}
              className="w-full h-auto rounded-full aspect-square"
            />
          )}
        </div>
        <div className="w-[87%]">
          <h4 className="">{(video.title?.length > 40) ? video.title.substring(0, 40) + '...' : video.title}</h4>
          {!hidesChannelName && (
            <p onClick={openChannel} className="secondary text-sm hover:text-gray-200">{video.channelName}</p>
          )}
          <p className="secondary text-sm">
            {(video.status == VideoStatusEnum.READY) ? (`${video.viewCount || 0} views`) : (`Being processed`)}
            &nbsp;•&nbsp;{timeSince(video.createdAt)} ago
          </p>
        </div>
      </div>
    </Wrapper>
  );
};

export default SquareVideoCard;
