import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { useParams } from 'react-router';

import EditChannelButton from './EditChannelButton.tsx';
import ChannelTabVideo from '@pages/channel/ChannelTabVideo.tsx';
import ChannelTabAbout from '@pages/channel/ChannelTabAbout.tsx';
import NoResults from '@components/NoResults';
import Button from '@styles/Button';
import Skeleton from '@skeletons/ChannelSkeleton';

import { addChannel, removeChannel } from '@reducers/user';
import {
  changeSubscriptionState,
  clearChannel,
  getChannel,
  addSubscription,
  removeSubscription,
} from '@reducers/channel';
import { addChannelLocalSt, client, removeChannelLocalSt } from '@utils';
import type { RootDispatch, RootState } from '@redux-store.ts';
import type { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { ChannelState, ChannelStateStatus } from '@models/channel.ts';
import type { UserStateData } from '@models/authUser.ts';

import defaultAvatar from '../../assets/default-avatar.svg';

const activeTabStyle = {
  borderBottom: '2px solid white',
  color: 'white',
};

type Wrapper = StyledComponentProps & { editChannel: boolean };

const Wrapper = styled.div<Wrapper>`
    background: ${(props) => props.theme.black};
    min-height: 100vh;
    padding-bottom: 7rem;

    .cover {
        height: 170px;
    }

    .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .header-tabs {
        padding: 1.2rem 1rem;
        background: ${(props) => props.theme.bg};
    }

    .header {
        width: 80%;
        display: flex;
        margin: 0 auto;
        justify-content: space-between;
        align-items: center;
    }

    .tabs,
    .tab {
        margin: 0 auto;
        margin-top: 1.5rem;
        width: 80%;
    }

    ul {
        list-style: none;
        display: flex;
        align-items: center;
    }

    li {
        margin-right: 2rem;
        text-transform: uppercase;
        letter-spacing: 1.1px;
    }

    li:hover {
        cursor: pointer;
    }

    @media screen and (max-width: 860px) {
        .header,
        .tabs,
        .tab {
            width: 90%;
        }
    }

    @media screen and (max-width: 470px) {
        .header,
        .tabs {
            width: 100%;
        }
    }

    ${(props) =>
            props.editChannel &&
            css`
                @media screen and (max-width: 440px) {
                    .header {
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: flex-start;
                    }
                }
            `}
`;

enum ChannelTab {
  VIDEOS,
  CHANNELS,
  ABOUT,
}

const Channel = () => {
  const { pathname } = useParams<{ pathname: string }>();

  const dispatch = useDispatch<RootDispatch>();
  const { id: userId } = useSelector<RootState, UserStateData>((state) => state.user.data);
  const { status, data: channel } = useSelector<RootState, ChannelState>((state) => state.channel);
  const [tab, setTab] = useState<ChannelTab>(ChannelTab.VIDEOS);

  const handleSubscribeButton = useCallback(() => {
    dispatch(changeSubscriptionState());
    // dispatch(addChannel(channel));
    // addChannelLocalSt(channel);
    // client(`${process.env.REACT_APP_BE}/users/${channel.id}/togglesubscribe`);
  }, [dispatch]);

  const handleUnsubscribe = () => {
    dispatch(changeSubscriptionState());
    // dispatch(removeChannel(channelId));
    // removeChannelLocalSt(channelId);
    // client(`${process.env.REACT_APP_BE}/users/${channelId}/togglesubscribe`);
  };

  useEffect(() => {
    dispatch(getChannel(pathname));

    return () => {
      dispatch(clearChannel());
    };
  }, [dispatch, pathname]);


  if (status == ChannelStateStatus.FETCHING_FAILED && !channel?.id) {
    return (
      <NoResults
        title="Page not found"
        text="The page you are looking for is not found or it may have been removed"
      />
    );
  }

  if (status == ChannelStateStatus.IS_FETCHING) {
    return <Skeleton />;
  }

  return (
    <Wrapper editChannel={channel.isOwned}>
      <div className="cover">
        {channel.cover && <img src={channel.cover} alt="channel-cover" />}
      </div>

      <div className="header-tabs">
        <div className="header">
          <div className="flex-row">
            <img
              className="avatar lg"
              src={channel.avatar || defaultAvatar}
              alt="channel avatar"
            />
            <div>
              <h3>{channel.name}</h3>
              <span className="secondary">
                {channel.subscriptionCount} subscribers
              </span>
            </div>
          </div>

          {channel.isOwned && <EditChannelButton />}

          {!channel.isOwned && (channel.subscribed ? (
            <Button grey onClick={() => handleSubscribeButton()}>Subscribed</Button>
          ) : (
            <Button onClick={() => handleSubscribeButton()}>Subscribe</Button>
          ))}
        </div>

        <div className="tabs">
          <ul className="secondary">
            <li
              style={tab === ChannelTab.VIDEOS ? activeTabStyle : {}}
              onClick={() => setTab(ChannelTab.VIDEOS)}
            >
              Videos
            </li>
            {/*<li*/}
            {/*  style={tab === ChannelTab.CHANNELS ? activeTabStyle : {}}*/}
            {/*  onClick={() => setTab(ChannelTab.CHANNELS)}*/}
            {/*>*/}
            {/*  Channels*/}
            {/*</li>*/}
            <li
              style={tab === ChannelTab.ABOUT ? activeTabStyle : {}}
              onClick={() => setTab(ChannelTab.ABOUT)}
            >
              About
            </li>
          </ul>
        </div>
      </div>

      <div className="tab">
        {tab === ChannelTab.VIDEOS && <ChannelTabVideo />}
        {tab === ChannelTab.ABOUT && <ChannelTabAbout />}
        {/*{tab === ChannelTab.CHANNELS && <ChannelTabChannels />}*/}
      </div>
    </Wrapper>
  );
};

export default Channel;
