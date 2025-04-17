import { ROUTES } from '../constants';
import { createBrowserRouter } from 'react-router';
import Login from '@pages/auth/Login.tsx';
import Signup from '@pages/auth/Signup.tsx';
import Auth from '@pages/auth/Auth.tsx';
import Home from '../pages/Home';
import Channel from '@pages/channel/Channel.tsx';
import SearchResults from '../pages/SearchResults';
import HomePageContainer from '@pages/homepage/HomePageContainer.tsx';
import WatchVideo from '@pages/watch/WatchVideo.tsx';
import { NotFoundErrorPage } from '../pages';

const UnauthenticatedPageRouter = createBrowserRouter([
  {
    path: ROUTES.AUTH, // non-required, because child's path has already contained full path
    Component: Auth,
    children: [
      {
        path: ROUTES.AUTH_LOGIN,
        Component: Login,
      },
      {
        path: ROUTES.AUTH_REGISTER, // must not contain start slash, otherwise full path must be specified
        Component: Signup,
      },
    ],
  },
  {
    path: ROUTES.INDEX,
    Component: HomePageContainer,
    children: [
      {
        Component: Home,
      },
      {
        path: '/watch/:videoId',
        Component: WatchVideo,
      },
      {
        path: '/channel/:userId',
        Component: Channel,
      },
      {
        path: '/results/:searchterm',
        Component: SearchResults,
      },
      {
        path: '*', // This catches any unmatched routes
        Component: NotFoundErrorPage,
      },
    ],

  },
]);

export default UnauthenticatedPageRouter;
