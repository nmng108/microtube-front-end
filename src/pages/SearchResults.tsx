import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router';
import { StyledTrending } from './Trending';
import TrendingCard from '../components/TrendingCard';
import NoResults from '../components/NoResults';
import ChannelInfo from '../components/ChannelInfo';
import Skeleton from '../skeletons/TrendingSkeleton';
import { clearSearchResults, getSearchResults, SearchingStatus, SearchResultState } from '../reducers/searchResult.ts';
import { isNotBlank } from '@utilities';
import { RootDispatch, RootState } from '@redux-store.ts';

const StyledChannels = styled.div`
    margin-top: 1rem;
`;

const SearchResults = () => {
  const dispatch = useDispatch<RootDispatch>();
  const {
    status,
    video: videoSearchResult,
    channel: channelSearchResult,
  } = useSelector<RootState, SearchResultState>((state) => state.searchResult);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = useMemo(() => searchParams.get('q'), [searchParams]);

  useEffect(() => {
    if (queryString && isNotBlank(queryString)) {
      dispatch(getSearchResults(queryString));
    }

    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, queryString]);

  if (status == SearchingStatus.IS_FETCHING) {
    return <Skeleton title="true" />;
  }

  if (status == SearchingStatus.FETCHING_DONE && !videoSearchResult.total && !channelSearchResult.total) {
    return <NoResults title="No results found" text="Try different keywords" />;
  }

  return (
    <StyledTrending>
      <h2>Search Results</h2>

      <StyledChannels>
        {channelSearchResult.total > 0 &&
          channelSearchResult.dataset.map((channel) => (
            <ChannelInfo key={channel.id} search={true} channel={channel} />
          ))}
      </StyledChannels>

      {videoSearchResult.total > 0 &&
        videoSearchResult.dataset.map((video) => (
          <Link key={video.id} to={`/watch/${video.code}`}>
            <TrendingCard video={video} />
          </Link>
        ))}
    </StyledTrending>
  );
};

export default SearchResults;
