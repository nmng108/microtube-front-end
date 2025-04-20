import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChannelCard from "./ChannelCard.tsx";
import { StyledTrending } from "../pages/Trending";
import Skeleton from "../skeletons/SuggestionSkeleton";
import { ChannelRecommendation, getChannels } from '@reducers/channelRecommendation';
import type { RootDispatch, RootState } from '@redux-store';

const Suggestions = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { isFetching, channels } = useSelector<RootState, ChannelRecommendation>((state) => state.channelRecommendation);

  useEffect(() => {
    dispatch(getChannels());
  }, [dispatch]);

  if (isFetching) {
    return <Skeleton />;
  }

  return (
    <StyledTrending>
      <h2>Suggestions For You</h2>
      {channels?.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </StyledTrending>
  );
};

export default Suggestions;
