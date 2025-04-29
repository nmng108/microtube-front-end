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
import Trending from '@pages/Trending.tsx';
import LikedVideos from '@pages/LikedVideos.tsx';
import Library from '@pages/Library.tsx';
import WatchHistory from '@pages/watchhistory/WatchHistory.tsx';
import SubscriptionsPage from '@pages/SubscriptionsPage.tsx';

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
        index: true,
        Component: Home,
      },
      {
        path: ROUTES.WATCH_WITH_PARAM,
        Component: WatchVideo,
      },
      {
        path: ROUTES.CHANNEL_WITH_PARAM,
        Component: Channel,
      },
      {
        path: ROUTES.SEARCH,
        Component: SearchResults,
      },

      {
        path: '/trending',
        Component: Trending,
      },
      {
        path: '/subscriptions',
        Component: SubscriptionsPage,
      },
      {
        path: ROUTES.LIKED_VIDEOS,
        Component: LikedVideos,
      },
      {
        path: '/library',
        Component: Library,
      },
      // {
      //   path: '/my-videos',
      //   Component: YourVideos,
      // },
      {
        path: ROUTES.WATCH_HISTORY,
        Component: WatchHistory,
      },

      {
        path: '*', // This catches any unmatched routes
        Component: NotFoundErrorPage,
      },
    ],
  },
]);

export default UnauthenticatedPageRouter;
