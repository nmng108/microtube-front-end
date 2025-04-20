import React, { useEffect } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../constants';
import type { RootState } from '@redux-store.ts';
import type { UserStateData } from '@models/authUser';
import { isBlank } from '@utilities';

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { username } = useSelector<RootState, UserStateData>((state) => state.user.data);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || isBlank(username)) return;

    const continuedPath = searchParams.get('continue');

    navigate(continuedPath ?? ROUTES.INDEX);
  }, [username, navigate, searchParams]);

  return (
    <Outlet />
  );
};

export default Auth;
