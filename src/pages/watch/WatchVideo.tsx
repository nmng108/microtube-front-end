import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { Link, useNavigate, useParams } from 'react-router';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
// UI elements
import CommentSection from '@pages/watch/CommentSection';
import NoResults from '@components/NoResults';
import { DislikeIcon, LikeIcon } from '@components/Icons';
import UpdateVideoModal from '@components/UpdateVideoModal';
import Skeleton from '@skeletons/WatchVideoSkeleton';

// reducers and others
import { changeSubscriptionState, channelActions, getChannel, getRecommendation, videoSliceActions } from '@reducers';
import { timeSince } from '@utils';
import type { RootDispatch, RootState } from '@redux-store';
import {
  ConciseVideoData,
  type DetailVideoData,
  RecommendationListState,
  VideoReactionEnum,
  VideoState,
  VideoStateStatus,
  VideoStatusEnum,
  VideoUpdateType,
} from '@models/video';
import { ChannelState, ChannelStateData } from '@models/channel';
import CustomVideoPlayer from '@components/CustomVideoPlayer';
import { StyledComponentProps } from '@styles/StyledComponentProps';
import defaultAvatar from '@assets/default-avatar.svg';
import Button from '@styles/Button.tsx';
import useVideoPlayerStore from '@store/video-player-store.ts';
import videoResource from '@api/videoResource.ts';
import watchHistoryResource from '@api/watchHistoryResource.ts';
import { ROUTES } from '@constants';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Icon } from '@mui/material';
import { toast } from 'react-toastify';
import RecommendedVideoCard from '@pages/watch/RecommendedVideoCard.tsx';

interface VideoAction {
  name: string;
  action: () => void;
  IconComponent?: React.ComponentType;
}

type MoreVideoOptions = {
  video: ConciseVideoData;
  usesVerticalIcon?: boolean;
};

// TODO: consider to put API calls & related states to a redux slice
const MoreVideoOptions: React.FC<MoreVideoOptions> = ({ video, usesVerticalIcon }) => {
  const dispatch = useDispatch<RootDispatch>();
  const ownedChannel = useSelector<RootState, ChannelStateData>((state) => state.user.data.ownedChannel);
  const [actions, setActions] = useState<VideoAction[]>([]);
  const [showsMoreActions, setShowsMoreActions] = useState<boolean>(false);
  const [showsUpdateModal, setShowsUpdateModal] = useState<boolean>(false);
  const [showsDeletionConfirmation, setShowsDeletionConfirmation] = useState<boolean>(false);
  const moreIconRef = useRef<SVGSVGElement>();
  const actionListElement = useRef<HTMLDivElement>();
  const MoreIcon = useMemo(() => (usesVerticalIcon ? MoreVertRoundedIcon : MoreHorizRoundedIcon), [usesVerticalIcon]);
  const navigate = useNavigate();

  const handleOpenCloseUpdateModal = useCallback(() => {
    setShowsUpdateModal((prev) => !prev);
  }, []);

  const handleOpenCloseDeletionConfirmation = useCallback(() => {
    setShowsDeletionConfirmation((prev) => !prev);
  }, []);

  const handleDelete = useCallback(async () => {
    const loadingToast = toast.loading('Deleting...');
    const { ok, problem, data } = await videoResource.delete(video.code);

    toast.done(loadingToast);

    if (ok) {
      toast.info('Request accepted');
      setTimeout(() => navigate(`${ROUTES.CHANNEL}/${ownedChannel.pathname}`), 500);
    } else {
      if (data.status === -1) {
        toast.error(data.message);
      } else {
        toast.error('Connection error. Try again later.');
      }
    }
  }, [navigate, ownedChannel?.pathname, video.code]);

  useEffect(() => {
    if (video.isOwned) {
      setActions([
        {
          name: 'Edit',
          action: handleOpenCloseUpdateModal,
          IconComponent: EditRoundedIcon,
        },
        {
          name: 'Delete',
          action: handleOpenCloseDeletionConfirmation,
          IconComponent: DeleteRoundedIcon,
        },
      ]);
    }
  }, [handleOpenCloseDeletionConfirmation, handleOpenCloseUpdateModal, video.isOwned]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreIconRef.current &&
        // 2 below conditions is unnecessary in this case
        !moreIconRef.current.contains(event.target as Node) &&
        !actionListElement.current?.contains(event.target as Node)
      ) {
        setShowsMoreActions(false);
      }
    };

    // Attach listener on document
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Clean up listener on unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (actions.length === 0) {
    return;
  }

  return (
    <div className="relative">
      <MoreIcon ref={moreIconRef} onClick={() => setShowsMoreActions((prev) => !prev)} className="block" />
      {showsMoreActions && (
        <div ref={actionListElement} className="absolute right-0 w-32 py-2 box-border rounded-sm bg-[#202020]">
          {actions.map((element, index) => (
            <div
              key={index}
              onClick={element.action}
              className="flex px-2 bg-[#202020] hover:bg-[#383838] cursor-pointer items-center space-x-2"
            >
              {element.IconComponent && <Icon component={element.IconComponent} />}
              <span>{element.name}</span>
            </div>
          ))}
        </div>
      )}

      {showsUpdateModal && <UpdateVideoModal video={video} closeModal={handleOpenCloseUpdateModal} />}

      <Dialog
        open={showsDeletionConfirmation}
        onClose={handleOpenCloseDeletionConfirmation}
        aria-labelledby="deletion-alert-title"
        aria-describedby="deletion-alert-description"
        className="text-gray-300"
      >
        <DialogTitle id="deletion-alert-title" className="bg-[#202020] text-gray-300">
          Do you confirm to delete this video?
        </DialogTitle>
        <DialogContent className="bg-[#202020]">
          <DialogContentText id="deletion-alert-description" className="text-gray-300">
            The data relating to this video may be deleted forever and cannot be retrieved again.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="bg-[#202020]">
          <Button onClick={handleOpenCloseDeletionConfirmation} autoFocus className="bg-[#383838]">
            Cancel
          </Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

type Wrapper = StyledComponentProps & {
  filledLike: boolean;
  filledDislike: boolean;
};

type SubWrapper = {
  theme: { blue: string };
};

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

  //.video-info {
  //    display: flex;
  //    justify-content: space-between;
  //}

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
  const { videoId, pos /*number*/ } = useParams();

  const dispatch = useDispatch<RootDispatch>();
  const { status: videoFetchingStatus, data: video } = useSelector<RootState, VideoState>((state) => state.video);
  const { status: channelStateStatus, data: channel } = useSelector<RootState, ChannelState>((state) => state.channel);
  const { isFetching: recommendationFetching, videos: next } = useSelector<RootState, RecommendationListState>(
    (state) => state.recommendation
  );
  const { playerRef, duration } = useVideoPlayerStore();

  /**
   * If true, gradually increase the `totalWatchTime` value.
   */
  const [isCountingWatchTime, setIsCountingWatchTime] = useState<boolean>(false);
  /**
   * Initialized with total of watch time fetched from server.
   */
  const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
  const hasLoggedIntoWatchHistory = useRef<boolean>(false);
  const hasReachedMinimumViewTime: boolean = useMemo(
    () => totalWatchTime >= (duration * 2) / 5,
    [duration, totalWatchTime]
  );
  const description = useMemo<string>(
    () =>
      video?.description?.replaceAll(
        /#\w+/g,
        (old) => `<a href="${ROUTES.SEARCH}?q=%23${old.substring(1)}" class="underline text-blue-600">${old}</a>`
      ),
    [video?.description]
  );

  const handleLike = useCallback(() => {
    dispatch(videoSliceActions.handleReaction(VideoReactionEnum.LIKE));
  }, [dispatch]);

  const handleDislike = useCallback(() => {
    dispatch(videoSliceActions.handleReaction(VideoReactionEnum.DISLIKE));
  }, [dispatch]);

  const handleSubscribe = useCallback(() => {
    dispatch(changeSubscriptionState());
  }, [dispatch]);

  useEffect(() => {
    dispatch(videoSliceActions.getVideo(videoId));
    dispatch(getRecommendation());

    return () => {
      dispatch(videoSliceActions.clearVideoState());
    };
  }, [dispatch, videoId]);

  useEffect(() => {
    if (video?.channelId > 0) {
      dispatch(getChannel(video.channelId));
    }

    return () => {
      dispatch(channelActions.clearChannel());
    };
  }, [dispatch, video.channelId]);

  useEffect(() => {
    if (playerRef.current) {
      const playerElement = playerRef.current;
      // TODO: find ways to frequently update pausePosition
      const updateHistory = (event: Event) => {
        watchHistoryResource
          .log({
            videoId,
            pausePosition: Math.floor(playerElement.currentTime),
          })
          .then(() => console.log('updated history'));
      };
      const startCounter = (event: Event) => !hasReachedMinimumViewTime && setIsCountingWatchTime(true);
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
  }, [playerRef, hasReachedMinimumViewTime, videoId]);

  // Set time counter
  useEffect(() => {
    if (isCountingWatchTime) {
      const interval = setInterval(() => setTotalWatchTime((prev) => prev + 1), 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isCountingWatchTime]);

  // Put video to user's watch history once the watch time >= 1s
  useEffect(() => {
    if (!hasLoggedIntoWatchHistory.current && totalWatchTime >= 1000) {
      hasLoggedIntoWatchHistory.current = true;
      watchHistoryResource.log({ videoId, pausePosition: playerRef.current.currentTime });
    }
  }, [playerRef, totalWatchTime, videoId]);

  // Increase view once the watch time reaches the required total of time
  useEffect(() => {
    if (isCountingWatchTime && hasReachedMinimumViewTime) {
      setIsCountingWatchTime(false);
      videoResource
        .update(videoId, { updateType: VideoUpdateType.INCREASE_VIEW })
        .then(() => console.log('updated view'));
    }
  }, [isCountingWatchTime, hasReachedMinimumViewTime, videoId]);

  if (videoFetchingStatus == VideoStateStatus.IS_FETCHING || recommendationFetching) {
    return <Skeleton />;
  }

  if (videoFetchingStatus == VideoStateStatus.FETCHING_FAILED && !video) {
    return (
      <NoResults title="Page not found" text="The page you are looking for is not found or it may have been removed" />
    );
  }

  return (
    <Wrapper filledLike={video && video.liked} filledDislike={video && video.disliked}>
      <div className="video-container">
        {video.status == VideoStatusEnum.READY ? (
          <div className="video">
            {videoFetchingStatus === VideoStateStatus.FETCHING_SUCCEEDED && <CustomVideoPlayer url={video.url} />}
          </div>
        ) : (
          <p>Video is not ready. Open again later.</p>
        )}

        <div className="flex justify-between">
          <div className="video-info">
            <h3>{video.title}</h3>

            <div className="video-info-stats">
              <span>
                {video.viewCount} views&nbsp;•&nbsp;{timeSince(video.createdAt)} ago
              </span>
            </div>
          </div>
          <div className="float-end flex items-center space-x-4">
            <p className="flex-row like">
              <LikeIcon onClick={handleLike} /> <span>{video.likeCount}</span>
            </p>
            <p className="flex-row dislike">
              <DislikeIcon onClick={handleDislike} /> <span>{video.dislikeCount}</span>
            </p>
            <MoreVideoOptions video={video} />
          </div>
        </div>

        <div className="channel-info-description">
          <div className="channel-info-flex">
            <div className="channel-info flex-row">
              <img className="avatar md" src={channel.avatar ?? defaultAvatar} alt="channel avatar" />
              <div className="channel-info-meta">
                <h4>
                  <Link to={`/channel/${channel.pathname}`}>{channel.name}</Link>
                </h4>
                <span className="secondary small">{channel.subscriptionCount} subscribers</span>
              </div>
            </div>
            {!channel.isOwned &&
              (channel.subscribed ? (
                <Button grey onClick={handleSubscribe}>
                  Subscribed
                </Button>
              ) : (
                <Button onClick={handleSubscribe}>Subscribe</Button>
              ))}
          </div>
          <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
        <CommentSection />
      </div>

      <div className="related-videos">
        <h3 style={{ marginBottom: '1rem' }}>Up Next</h3>
        {next
          ?.filter((vid) => vid.id !== video.id)
          // .slice(0, 3)
          .map((video: DetailVideoData, index) => (
            <Link key={index} to={`${ROUTES.WATCH}/${video.code}`}>
              <RecommendedVideoCard key={video.id} video={video} hidesAvatar={true} hidesDescription={true} />
            </Link>
          ))}
      </div>
    </Wrapper>
  );
};

export default WatchVideo;
