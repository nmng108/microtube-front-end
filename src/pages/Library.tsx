import React from 'react';
import LikedVideos from './LikedVideos';
import WatchHistory from './watchhistory/WatchHistory.tsx';

const Library = () => (
  <>
    <WatchHistory nopad={true} />
    <LikedVideos />
  </>
);

export default Library;
