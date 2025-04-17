import React from 'react';

type Props = {
  url: string,
  type: string,
}

const PreviewPlayer: React.FC<Props> = ({ url, type }) => {
  return (
    <video controls className='w-full h-full'>
      <source src={url} type={type}  />
    </video>
    // <ReactPlayer
    //   url={url}
    //   controls={true}
    //   playing={false}
    //   muted={true}
    // />
  );
};

export default PreviewPlayer;
