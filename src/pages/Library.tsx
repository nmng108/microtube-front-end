import React from "react";
import LikedVideos from "./LikedVideos";
import WatchHistory from "./WatchHistory.tsx";

const Library = () => (
  <>
    <WatchHistory nopad={true} />
    <LikedVideos />
  </>
);

export default Library;
