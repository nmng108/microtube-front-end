import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { Link, useParams } from 'react-router';

// UI elements
import CommentSection from '@pages/watch/CommentSection.tsx';
import VideoCard from '@components/VideoCard';
import NoResults from '@components/NoResults';
import { DislikeIcon, LikeIcon } from '@components/Icons';
import Skeleton from '@skeletons/WatchVideoSkeleton';

// reducers and others
import {
  changeSubscriptionState,
  clearChannel,
  clearVideo,
  getChannel,
  getRecommendation,
  getVideo,
  handleReaction,
} from '@reducers';
import { timeSince } from '@utils';
import type { RootDispatch, RootState } from '@redux-store';
import {
  type DetailVideoData,
  RecommendationListState,
  VideoReactionEnum,
  VideoState,
  VideoStateStatus,
  VideoStatusEnum,
  VideoUpdateType,
} from '@models/video';
import { ChannelState } from '@models/channel';
import CustomVideoPlayer from '@components/CustomVideoPlayer';
import { StyledComponentProps } from '@styles/StyledComponentProps';
import defaultAvatar from '@assets/default-avatar.svg';
import Button from '@styles/Button.tsx';
import useVideoPlayerStore from '@store/video-player-store.ts';
import videoResource from '@api/videoResource.ts';
import watchHistoryResource from '@api/watchHistoryResource.ts';

type Wrapper = StyledComponentProps & {
  filledLike: boolean;
  filledDislike: boolean;
}

type SubWrapper = {
  theme: { blue: string };
}

const Wrapper = styled.div<Wrapper>`
    display: grid;
    grid-template-columns: 70% 1fr;
    grid-gap: 2rem;
    padding: 1.3rem;
    padding-bottom: 7rem;

    .video-container .video-info {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    .video-info span {
        color: ${(props) => props.theme.secondaryColor};
    }

    .channel-info-flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .video-info-stats {
        display: flex;
        align-items: center;
    }

    .video-info-stats div {
        margin-left: 6rem;
        position: relative;
        top: -2px;
    }

    .channel-info-flex button {
        font-size: 0.9rem;
    }

    .channel-info-description {
        padding-top: 1rem;
        border-bottom: 1px solid ${(props) => props.theme.darkGrey};
        border-top: 1px solid ${(props) => props.theme.darkGrey};
    }

    .channel-info-description p {
        font-size: 0.9rem;
        padding: 1rem 0;
    }

    .related-videos img {
        height: 140px;
    }

    .related-videos div {
        margin-bottom: 1rem;
    }

    svg {
        fill: ${(props) => props.theme.darkGrey};
    }

    ${(props) =>
            props.filledLike &&
            css`
                .like svg {
                    fill: ${(props: SubWrapper) => props.theme.blue};
                }
            `}

    ${(props) =>
            props.filledDislike &&
            css`
                .dislike svg {
                    fill: ${(props: SubWrapper) => props.theme.blue};
                }
            `} @media screen and (
    max-width: 930px) {
    grid-template-columns: 90%;

    .related-videos {
        display: none;
    }
}

    @media screen and (max-width: 930px) {
        grid-template-columns: 1fr;
    }

    @media screen and (max-width: 425px) {
        .video-info-stats div {
            margin-left: 1rem;
        }
    }
`;

const WatchVideo = () => {
  const { videoId, pos/*number*/ } = useParams();

  const dispatch = useDispatch<RootDispatch>();
  const { status: videoFetchingStatus, data: video } = useSelector<RootState, VideoState>((state) => state.video);
  const { status: channelStateStatus, data: channel } = useSelector<RootState, ChannelState>((state) => state.channel);
  const {
    isFetching: recommendationFetching,
    videos: next,
  } = useSelector<RootState, RecommendationListState>((state) => state.recommendation);
  const { playerRef, duration } = useVideoPlayerStore();

  /**
   * Gradually increase the `totalWatchTime` value.
   */
  const [isCountingWatchTime, setIsCountingWatchTime] = useState<boolean>(false);
  /**
   * Initialized with total of watch time fetched from server.
   */
  const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
  const reachedMinViewTime: boolean = useMemo(() => totalWatchTime >= (duration * 2 / 5), [duration, totalWatchTime]);

  const handleLike = useCallback(() => {
    dispatch(handleReaction(VideoReactionEnum.LIKE));
  }, [dispatch]);

  const handleDislike = useCallback(() => {
    dispatch(handleReaction(VideoReactionEnum.DISLIKE));
  }, [dispatch]);

  const handleSubscribe = useCallback(() => {
    dispatch(changeSubscriptionState());
  }, [dispatch]);

  const handleUnsubscribe = useCallback(() => {
    // dispatch(removeChannel());
  }, []);

  useEffect(() => {
    dispatch(getVideo(videoId));
    dispatch(getRecommendation());

    return () => {
      dispatch(clearVideo());
    };
  }, [dispatch, videoId]);

  useEffect(() => {
    if (video?.channelId > 0) {
      dispatch(getChannel(video.channelId));
    }

    return () => {
      dispatch(clearChannel());
    };
  }, [dispatch, video.channelId]);

  useEffect(() => {
    if (playerRef.current) {
      const playerElement = playerRef.current;
      const updateHistory = (event: Event) => {
        watchHistoryResource.log({
          videoId,
          pausePosition: Math.floor(playerElement.currentTime),
        }).then(() => console.log('updated history'));
      };
      const startCounter = (event: Event) => !reachedMinViewTime && setIsCountingWatchTime(true);
      const pauseCounter = (event: Event) => setIsCountingWatchTime(false);

      playerElement.addEventListener('playing', updateHistory);
      playerElement.addEventListener('pause', updateHistory);
      playerElement.addEventListener('waiting', updateHistory);
      playerElement.addEventListener('ended', updateHistory);

      playerElement.addEventListener('playing', startCounter);
      playerElement.addEventListener('pause', pauseCounter);
      playerElement.addEventListener('waiting', pauseCounter);
      playerElement.addEventListener('ended', pauseCounter);

      return () => {
        playerElement.removeEventListener('playing', updateHistory);
        playerElement.removeEventListener('pause', updateHistory);
        playerElement.removeEventListener('waiting', updateHistory);
        playerElement.removeEventListener('ended', updateHistory);

        playerElement.removeEventListener('playing', startCounter);
        playerElement.removeEventListener('pause', pauseCounter);
        playerElement.removeEventListener('waiting', pauseCounter);
        playerElement.removeEventListener('ended', pauseCounter);
      };
    }
  }, [playerRef, reachedMinViewTime, videoId]);

  useEffect(() => {
    if (isCountingWatchTime) {
      const interval = setInterval(() => setTotalWatchTime((prev) => prev + 1), 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isCountingWatchTime]);

  useEffect(() => {
    if (isCountingWatchTime && reachedMinViewTime) {
      setIsCountingWatchTime(false);
      videoResource.update(videoId, { updateType: VideoUpdateType.INCREASE_VIEW }).then(() => console.log('updated view'));
    }
  }, [isCountingWatchTime, reachedMinViewTime, videoId]);

  if (videoFetchingStatus == VideoStateStatus.IS_FETCHING || recommendationFetching) {
    return <Skeleton />;
  }

  if (videoFetchingStatus == VideoStateStatus.FETCHING_FAILED && !video) {
    return (
      <NoResults
        title="Page not found"
        text="The page you are looking for is not found or it may have been removed"
      />
    );
  }

  return (
    <Wrapper
      filledLike={video && video.liked}
      filledDislike={video && video.disliked}
    >
      <div className="video-container">
        {(video.status == VideoStatusEnum.READY) ? (
          <div className="video">{videoFetchingStatus === VideoStateStatus.FETCHING_SUCCEEDED &&
            <CustomVideoPlayer url={video.url} />}</div>
        ) : (
          <p>Video is not ready. Open again later.</p>
        )}

        <div className="video-info">
          <h3>{video.title}</h3>

          <div className="video-info-stats">
            <p>
              <span>{video.viewCount} views</span> <span>•</span>{' '}
              <span>{timeSince(video.createdAt)} ago</span>
            </p>

            <div className="likes-dislikes flex-row">
              <p className="flex-row like">
                <LikeIcon onClick={handleLike}  />{' '}
                <span>{video.likeCount}</span>
              </p>
              <p className="flex-row dislike" style={{ marginLeft: '1rem' }}>
                <DislikeIcon onClick={handleDislike} />{' '}
                <span>{video.dislikeCount}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="channel-info-description">
          <div className="channel-info-flex">
            <div className="channel-info flex-row">
              <img
                className="avatar md"
                src={channel.avatar ?? defaultAvatar}
                alt="channel avatar"
              />
              <div className="channel-info-meta">
                <h4>
                  <Link to={`/channel/${channel.pathname}`}>
                    {channel.name}
                  </Link>
                </h4>
                <span className="secondary small">
                  {channel.subscriptionCount} subscribers
                </span>
              </div>
            </div>
            {!channel.isOwned && (channel.subscribed ? (
              <Button grey onClick={handleSubscribe}>Subscribed</Button>
            ) : (
              <Button onClick={handleSubscribe}>Subscribe</Button>
            ))}
          </div>

          <p>{video.description}</p>
        </div>
        <CommentSection />
      </div>

      <div className="related-videos">
        <h3 style={{ marginBottom: '1rem' }}>Up Next</h3>
        {next
          .filter((vid) => vid.id !== video.id)
          .slice(0, 3)
          .map((video: DetailVideoData) => (
            <Link key={video.id} to={`/watch/${video.code}`}>
              <VideoCard key={video.id} hideavatar={true} video={video} />
            </Link>
          ))}
      </div>
    </Wrapper>
  );
};

export default WatchVideo;
