import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import { closeSidebar } from '../reducers/sidebar';
import type { RootDispatch, RootState } from '../redux-store.ts';
import { ChannelStateData } from '../models/channel.ts';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';

const Wrapper = styled.div<StyledComponentProps>`
    h4 {
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

const Subscriptions = () => {
  const dispatch = useDispatch<RootDispatch>();
  const channels = useSelector<RootState, ChannelStateData[]>((state) => state.user.channels);

  return (
    <Wrapper>
      {channels?.length > 0 && <h4>Subscriptions</h4>}

      {channels?.map((channel) => (
        <Link
          key={channel.id}
          onClick={() => dispatch(closeSidebar())}
          to={`/channel/${channel.id}`}
        >
          <div className="channel">
            <img src={channel.avatar} alt="avatar" />
            <span>{channel.name}</span>
          </div>
        </Link>
      ))}
    </Wrapper>
  );
};

export default Subscriptions;
