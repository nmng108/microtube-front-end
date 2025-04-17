import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router';
import type { RootDispatch, RootState } from './redux-store.ts';
import { UserState } from '@models/authUser';
import UnauthenticatedPageRouter from './routes/UnauthenticatedPageRouter';
import AuthenticatedPageRouter from './routes/AuthenticatedPageRouter';

import 'react-toastify/dist/ReactToastify.css';
import GlobalStyle from './styles/GlobalStyle';
import { darkTheme } from './styles/theme';
import { getUserDetails } from '@reducers';
import { isNotBlank } from '@utilities';

const App = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { data, problemMessage } = useSelector<RootState, UserState>((state) => state.user);
  const username: string = useMemo(() => data.username, [data?.username]);
  const [router, setRouter] = React.useState<typeof UnauthenticatedPageRouter>(username ? AuthenticatedPageRouter : UnauthenticatedPageRouter);

  useEffect(() => {
    if (username) {
      setRouter(AuthenticatedPageRouter);
      dispatch(getUserDetails());
    } else {
      setRouter(UnauthenticatedPageRouter);
    }
  }, [dispatch, username]);

  useEffect(() => {
    if (problemMessage && isNotBlank(problemMessage)) {
      toast.error(problemMessage);
      // dispatch(removeAuthErrorMessage()); // cause the toast to render twice?
    }
  }, [problemMessage, dispatch]);

  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <ToastContainer autoClose={2500} position="top-right" closeButton={false} />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
