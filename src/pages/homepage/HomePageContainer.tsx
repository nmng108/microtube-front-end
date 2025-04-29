import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router';

import ScrollToTop from '@components/ScrollToTop';
import Header from '@pages/homepage/Header.tsx';
import BottomBar from '@components/BottomBar';
import Sidebar from '@pages/homepage/Sidebar.tsx';
import Container from '@styles/Container';
import type { RootState } from '@redux-store.ts';
import { isNotBlank } from '@utilities';

const HomePageContainer: React.FC = () => {
  const username = useSelector<RootState, string>((state) => state.user.data.username);
  const navigate = useNavigate();

  useEffect(() => {
    if (username && isNotBlank(username)) return;
  }, [navigate, username]);

  return (
    <>
      <ScrollToTop />
      <Header />
      <Sidebar />
      <BottomBar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
};

export default HomePageContainer;
