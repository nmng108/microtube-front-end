import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from '@redux-store.ts';

const ChannelTabAbout = () => {
  const  description = useSelector<RootState, string>((state) => state.channel.data.description);

  return <p className="whitespace-pre-line">{description ?? "No description for this channel"}</p>;
};

export default ChannelTabAbout;
