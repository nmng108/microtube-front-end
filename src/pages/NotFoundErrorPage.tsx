import React from 'react';
import NoResults from '@components/NoResults.tsx';

const NotFoundErrorPage: React.FC = () => {
  return (
    <NoResults
      title="Page not found"
      text="The page you are looking for is not found or it may have been removed"
    />
  );
};

export default NotFoundErrorPage;