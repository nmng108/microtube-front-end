import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import { closeSidebar } from '@reducers/sidebar';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { SubscriptionPageState, subscriptionSliceActions } from '@reducers';
import { ROUTES } from '@constants';
import defaultAvatar from '@assets/default-avatar.svg';

const Wrapper = styled.div<StyledComponentProps>`
    h5 {
        text-transform: uppercase;
        margin-bottom: 0.5rem;
        letter-spacing: 1.2px;
        color: ${(props) => props.theme.secondaryColor};
        padding-left: 1.5rem;
    }

    .channel {
        display: flex;
        align-items: center;
        padding: 0.2rem 0;
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
    }

    .channel:hover {
        cursor: pointer;
        background: ${(props) => props.theme.darkGrey};
    }

    .channel img {
        margin-right: 1rem;
        width: 22px;
        height: 22px;
        object-fit: cover;
        border-radius: 11px;
    }
`;

const SubscriptionList = () => {
  const dispatch = useDispatch<RootDispatch>();
  const {
    channel: subscribedChannelList,
    video: subscribedVideoList,
  } = useSelector<RootState, SubscriptionPageState>((state) => state.subscription);

  useEffect(() => {
    dispatch(subscriptionSliceActions.getSubscribedChannels({}));
  }, [dispatch]);

  return (
    <Wrapper>
      {subscribedChannelList.dataset?.length > 0 && (
        <>
          <h5>Subscriptions</h5>

          {subscribedChannelList.dataset.map((channel, index) => (
            <Link
              key={index}
              onClick={() => dispatch(closeSidebar())}
              to={`${ROUTES.CHANNEL}/${channel.pathname}`}
            >
              <div className="channel">
                <img src={channel.avatar || defaultAvatar} alt="avatar" />
                <span>{channel.name}</span>
              </div>
            </Link>
          ))}
        </>
      )}
    </Wrapper>
  );
};

export default SubscriptionList;
