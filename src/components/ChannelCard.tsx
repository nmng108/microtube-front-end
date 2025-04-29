import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import Button from '../styles/Button';

// reducers and utils
import { addChannel, removeChannel } from '@reducers';
import { changeChannelSubscriptionStateInSearchResult } from '@reducers/searchResult.ts';
// import { toggleSubscribeChannelRecommendation } from "../reducers/channelRecommendation";
import { ChannelStateData } from '@models/channel.ts';
import { RootDispatch } from '@redux-store.ts';
import defaultAvatar from '@assets/default-avatar.svg';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2rem 0;

  .avatar-channel {
    display: flex;
    width: 70%;
    align-items: center;
  }

  .subscribe-channel {
    display: flex;
    align-items: center;
  }

  .description {
    width: 90%;
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    object-fit: cover;
    margin-right: 1.2rem;
  }

  p span:first {
    padding-right: 0.6rem;
  }

  @media screen and (max-width: 580px) {
    font-size: 0.9rem;

    button {
      font-size: 0.9rem;
    }

    img {
      width: 100px;
      height: 100px;
      border-radius: 50px;
    }
  }

  @media screen and (max-width: 510px) {
    p.description {
      display: none;
    }
  }

  @media screen and (max-width: 450px) {
    img {
      width: 50px;
      height: 50px;
      border-radius: 25px;
    }
  }

  @media screen and (max-width: 420px) {
    .to-hide {
      display: none;
    }
  }
`;

type Props = {
  channel: ChannelStateData;
  search?: boolean;
};

const ChannelCard: React.FC<Props> = ({ search, channel }) => {
  const dispatch = useDispatch<RootDispatch>();

  const handleSubscribe = () => {
    if (search) {
      dispatch(changeChannelSubscriptionStateInSearchResult(channel.id));
    }

    // dispatch(toggleSubscribeChannelRecommendation(channel.id));

    // dispatch(addChannel(channel));
    // addChannelLocalSt(channel);
  };

  const handleUnsubscribe = () => {
    if (search) {
      dispatch(changeChannelSubscriptionStateInSearchResult(channel.id));
    }

    // dispatch(toggleSubscribeChannelRecommendation(channel.id));

    // dispatch(removeChannel(channel.id));
    // removeChannelLocalSt(channel.id);
  };

  return (
    <Wrapper>
      <Link to={`/channel/${channel.id}`} className="avatar-channel">
        <img src={channel.avatar || defaultAvatar} alt="avatar" />

        <div className="channel-info-meta w-2/3">
          <h3>{channel.name}</h3>

          <p className="secondary">
            <span>{channel.subscriptionCount} subscribers</span> <span className="to-hide">•</span>{' '}
            <span className="to-hide">{channel.videoCount} videos</span>
          </p>

          {channel.description && (
            <p className="description secondary">
              {channel.description?.length < 65 ? channel.description : `${channel.description?.substring(0, 65)}...`}
            </p>
          )}
        </div>
      </Link>

      <div className="w-[28%] flex justify-end">
        {!channel.isOwned && !channel.subscribed && <Button onClick={() => handleSubscribe()}>Subscribe</Button>}

        {!channel.isOwned && channel.subscribed && (
          <Button grey onClick={() => handleUnsubscribe()}>
            Subscribed
          </Button>
        )}
      </div>
    </Wrapper>
  );
};

export default ChannelCard;
