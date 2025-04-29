import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router';
import SubscriptionList from '@pages/homepage/SubscriptionList.tsx';
import { HomeIcon, TrendingIcon, SubIcon, LibIcon, HistoryIcon, VidIcon, LikeIcon } from '@components/Icons';
import { closeSidebar, SidebarState } from '@reducers/sidebar';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { ROUTES } from '@constants';
import { UserStateData } from '@models/authUser';
import { Button } from '@mui/material';
import UpdateChannelModal from '@pages/channel/UpdateChannelModal.tsx';
import CreateChannelModal from '@components/CreateChannelModal.tsx';
import { getLoginPathWithContinuedPath } from '@constants/routes.ts';

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
  const { id: userId, ownedChannel } = useSelector<RootState, UserStateData>((state) => state.user.data);
  const [showsCreateChannelModal, setShowsCreateChannelModal] = useState<boolean>(false);
  const loggedIn = useMemo<boolean>(() => userId && userId > 0, [userId]);

  const handleCloseSidebar = useCallback(() => {
    dispatch(closeSidebar());
  }, [dispatch]);

  const closeCreateChannelModal = useCallback(() => {
    setShowsCreateChannelModal(false);
  }, []);

  return (
    <Wrapper open={open}>
      <NavLink onClick={handleCloseSidebar} to="/" className="active">
        <div className="icon">
          <HomeIcon />
          <span>Home</span>
        </div>
      </NavLink>
      <NavLink to="/trending" onClick={handleCloseSidebar} className="active">
        <div className="icon">
          <TrendingIcon />
          <span>Trending</span>
        </div>
      </NavLink>
      <NavLink to="/subscriptions" onClick={handleCloseSidebar} className="active">
        <div className="icon">
          <SubIcon />
          <span>Subscriptions</span>
        </div>
      </NavLink>

      <div className="ruler"></div>

      <NavLink
        to={loggedIn ? ROUTES.LIKED_VIDEOS : getLoginPathWithContinuedPath(ROUTES.LIKED_VIDEOS)}
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <LikeIcon />
          <span>Liked videos</span>
        </div>
      </NavLink>
      <NavLink
        to={loggedIn ? '/library' : getLoginPathWithContinuedPath('/library')}
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <LibIcon />
          <span>Library</span>
        </div>
      </NavLink>

      <NavLink
        to={loggedIn ? ROUTES.WATCH_HISTORY : getLoginPathWithContinuedPath(ROUTES.WATCH_HISTORY)}
        onClick={handleCloseSidebar}
        className="active"
      >
        <div className="icon">
          <HistoryIcon />
          <span>History</span>
        </div>
      </NavLink>

      {ownedChannel && (
        <NavLink to={`${ROUTES.CHANNEL}/${ownedChannel.pathname}`} onClick={handleCloseSidebar} className="active">
          <div className="icon">
            <VidIcon />
            <span>Your channel</span>
          </div>
        </NavLink>
      )}
      {loggedIn && !ownedChannel && (
        <div onClick={() => setShowsCreateChannelModal(true)} className="active cursor-pointer">
          <div className="icon">
            <VidIcon />
            <span>Your channel</span>
          </div>
        </div>
      )}

      <div className="ruler"></div>
      <SubscriptionList />

      {showsCreateChannelModal && <CreateChannelModal closeModal={closeCreateChannelModal} />}
    </Wrapper>
  );
};

export default Sidebar;
