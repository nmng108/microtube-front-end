import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { SubscriptionPageState, subscriptionSliceActions } from '@reducers';
import { ROUTES } from '@constants';
import RectangleVideoCard from '@components/RectangleVideoCard.tsx';
import ChannelCard from '@components/ChannelCard.tsx';
import { StyledHome } from '@pages/Home';

const SubscriptionsPage = () => {
  const dispatch = useDispatch<RootDispatch>();
  const {
    channel: subscribedChannelList,
    video: subscribedVideoList,
  } = useSelector<RootState, SubscriptionPageState>((state) => state.subscription);

  useEffect(() => {
    dispatch(subscriptionSliceActions.getSubscriptionPageContents());

    return () => {
      dispatch(subscriptionSliceActions.clearSlice());
    };
  }, [dispatch]);

  // <p>You haven't subscribed to any channel</p>

  return (
    <StyledHome>
      {/*<h4>Subscriptions</h4>*/}

      <div className="mt-4">
        {subscribedChannelList.total > 0 && subscribedChannelList.dataset.map((channel, index) => (
          <ChannelCard key={index} search={true} channel={channel} />
        ))}
      </div>

      {subscribedVideoList.total > 0 && subscribedVideoList.dataset.map((video, index) => (
        <Link key={index} to={`${ROUTES.WATCH}/${video.code}`}>
          <RectangleVideoCard video={video} />
        </Link>
      ))}
    </StyledHome>
  );
};

export default SubscriptionsPage;
