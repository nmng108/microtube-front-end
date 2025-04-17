import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router';
import Subscriptions from '@components/Subscriptions';
import {
  HomeIcon,
  TrendingIcon,
  SubIcon,
  LibIcon,
  HistoryIcon,
  VidIcon,
  LikeIcon,
} from '@components/Icons';
import { closeSidebar, SidebarState } from '@reducers/sidebar';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { ROUTES } from '@constants';
import { UserStateData } from '@models/authUser';

type Wrapper = StyledComponentProps & { open: boolean };

const Wrapper = styled.div<Wrapper>`
    position: fixed;
    top: 55px;
    left: 0;
    height: 100vh;
    width: 240px;
    background: ${(props) => props.theme.grey};
    padding-top: 1rem;
    overflow: auto;
    padding-bottom: 1.5rem;
    transition: all 0.3s;
    z-index: 2;

    &::-webkit-scrollbar {
        width: 0;
    }

    .icon {
        display: flex;
        align-items: center;
        padding: 0.2rem 0;
        padding-left: 1.5rem;
        margin-bottom: 0.4rem;
    }

    .icon:not(.hover-disable):hover {
        background: ${(props) => props.theme.darkGrey};
        cursor: pointer;
    }

    .active div {
        background: ${(props) => props.theme.darkGrey};
        cursor: pointer;
    }

    .active svg {
        fill: #fff;
    }

    .icon span {
        padding-left: 1rem;
        position: relative;
        top: 1px;
    }

    @media screen and (max-width: 1093px) {
        transform: translateX(-100%);

        ${(props) =>
                props.open &&
                css`
                    transform: translateX(0);
                `}
    }
`;

const Sidebar = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { sidebar: open } = useSelector<RootState, SidebarState>((state) => state.sidebar);
  const { ownedChannel } = useSelector<RootState, UserStateData>((state) => state.user.data);

  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };

  return (
    <Wrapper open={open}>
      <NavLink
        onClick={handleCloseSidebar}
        to="/"
        className="active"
      >
        <div className="icon">
          <HomeIcon />
          <span>Home</span>
        </div>
      </NavLink>
      <NavLink
        to="/feed/trending"
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <TrendingIcon />
          <span>Trending</span>
        </div>
      </NavLink>
      <NavLink
        to="/feed/subscriptions"
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <SubIcon />
          <span>Subscriptions</span>
        </div>
      </NavLink>

      <div className="ruler"></div>

      <NavLink
        to="/feed/liked-videos"
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <LikeIcon />
          <span>Liked videos</span>
        </div>
      </NavLink>
      <NavLink
        to="/feed/library"
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <LibIcon />
          <span>Library</span>
        </div>
      </NavLink>

      <NavLink
        to="/watch-history"
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <HistoryIcon />
          <span>History</span>
        </div>
      </NavLink>

      {ownedChannel && (
        <NavLink
          to={`${ROUTES.CHANNEL}/${ownedChannel.pathname}`}
          onClick={handleCloseSidebar}
          className="active"
        >
          <div className="icon">
            <VidIcon />
            <span>Your channel</span>
          </div>
        </NavLink>
      )}

      <div className="ruler"></div>

      <Subscriptions />
    </Wrapper>
  );
};

export default Sidebar;
