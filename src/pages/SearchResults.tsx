import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router';
import { StyledTrending } from './Trending';
import RectangleVideoCard from '@components/RectangleVideoCard.tsx';
import NoResults from '../components/NoResults';
import ChannelCard from '@components/ChannelCard.tsx';
import Skeleton from '../skeletons/TrendingSkeleton';
import { clearSearchResults, getSearchResults, SearchingStatus, SearchResultState } from '@reducers/searchResult.ts';
import { isBlank, isNotBlank } from '@utilities';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { ROUTES } from '@constants';

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

  if (!queryString || isBlank(queryString)) {
    return <NoResults title="No result" text="Enter keywords to search" />;
  }

  if (status == SearchingStatus.IS_FETCHING) {
    return <Skeleton />;
  }

  if (status == SearchingStatus.FETCHING_DONE && !videoSearchResult.total && !channelSearchResult.total) {
    return <NoResults title="No results found" text="Try different keywords" />;
  }

  return (
    <StyledTrending>
      <h2>Search Results</h2>

      <StyledChannels>
        {channelSearchResult.total > 0 && channelSearchResult.dataset.map((channel, index) => (
          <ChannelCard key={index} search={true} channel={channel} />
        ))}
      </StyledChannels>

      {videoSearchResult.total > 0 && videoSearchResult.dataset.map((video, index) => (
        <Link key={index} to={`${ROUTES.WATCH}/${video.code}`}>
          <RectangleVideoCard video={video} />
        </Link>
      ))}
    </StyledTrending>
  );
};

export default SearchResults;
