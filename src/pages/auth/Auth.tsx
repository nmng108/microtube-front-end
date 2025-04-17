import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../constants';
import type { RootState } from '@redux-store.ts';
import type { UserStateData } from '@models/authUser';
import { isBlank } from '@utilities';

const Auth = () => {
  const { username } = useSelector<RootState, UserStateData>((state) => state.user.data);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || isBlank(username)) return;
    // TODO: store last unauthenticated navigation and re-navigate to it after user has logged in
    navigate(ROUTES.INDEX);
  }, [username, navigate]);

  return (
    <Outlet />
  );
};

export default Auth;
