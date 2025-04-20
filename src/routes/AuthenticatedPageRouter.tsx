import { createBrowserRouter } from 'react-router';
import { NotFoundErrorPage } from '@pages';
import Home from '@pages/Home';
import Trending from '@pages/Trending';
import Channel from '@pages/channel/Channel';
import WatchVideo from '@pages/watch/WatchVideo.tsx';
import SearchResults from '@pages/SearchResults';
import Library from '@pages/Library';
import WatchHistory from '@pages/WatchHistory.tsx';
import LikedVideos from '@pages/LikedVideos';
import HomePageContainer from '@pages/homepage/HomePageContainer';
import { ROUTES } from '@constants';
import UpdateUserInfo from '@pages/userprofile/UpdateUserInfo.tsx';
import SubscriptionsPage from '@pages/SubscriptionsPage.tsx';

const AuthenticatedPageRouter = createBrowserRouter([
  {
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
        path: ROUTES.USER_PROFILE,
        Component: UpdateUserInfo,
      },
      {
        path: '*', // This catches any unmatched routes
        Component: NotFoundErrorPage,
      },
    ],
  },
]);

export default AuthenticatedPageRouter;
