import { createBrowserRouter } from 'react-router';
import { NotFoundErrorPage } from '@pages';
import Home from '@pages/Home';
import Trending from '@pages/Trending';
import Subscriptions from '@pages/Subscriptions';
import Channel from '@pages/channel/Channel';
import WatchVideo from '@pages/watch/WatchVideo.tsx';
import SearchResults from '@pages/SearchResults';
import Library from '@pages/Library';
import History from '@pages/History';
import YourVideos from '@pages/YourVideos';
import LikedVideos from '@pages/LikedVideos';
import HomePageContainer from '@pages/homepage/HomePageContainer';

const AuthenticatedPageRouter = createBrowserRouter([
  {
    Component: HomePageContainer,
    children: [
      {
        index: true,
        // element: <MainPageContainer><Home /></MainPageContainer>,
        Component: Home,
      },
      {
        path: '/watch/:videoId',
        // element: <MainPageContainer><WatchVideo /></MainPageContainer>,
        Component: WatchVideo,
      },
      {
        path: '/channel/:pathname',
        // element: <MainPageContainer><Channel /></MainPageContainer>,
        Component: Channel,
      },
      {
        path: '/search',
        // element: <MainPageContainer><SearchResults /></MainPageContainer>,
        Component: SearchResults,
      },
      {
        path: '/feed/trending',
        // element: <MainPageContainer><Trending /></MainPageContainer>,
        Component: Trending,
      },
      {
        path: '/feed/subscriptions',
        // element: <MainPageContainer><Subscriptions /></MainPageContainer>,
        Component: Subscriptions,
      },
      {
        path: '/feed/library',
        // element: <MainPageContainer><Library /></MainPageContainer>,
        Component: Library,
      },
      {
        path: '/watch-history',
        // element: <MainPageContainer><History /></MainPageContainer>,
        Component: History,
      },
      {
        path: '/feed/my-videos',
        // element: <MainPageContainer><YourVideos /></MainPageContainer>,
        Component: YourVideos,
      },
      {
        path: '/feed/liked-videos',
        // element: <MainPageContainer><LikedVideos /></MainPageContainer>,
        Component: LikedVideos,
      },
      {
        path: '*', // This catches any unmatched routes
        // element: <MainPageContainer><NotFoundErrorPage /></MainPageContainer>,
        Component: NotFoundErrorPage,
      },
    ],
  },
]);

export default AuthenticatedPageRouter;
