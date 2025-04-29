import React, { useEffect, useState } from 'react';
import Hls, { Events, ErrorTypes } from 'hls.js';
import styled from 'styled-components';
import { Loader } from '@components/ui';
import useVideoPlayerStore from '@store/video-player-store';

declare const window: Window &
  typeof globalThis & {
    Hls: typeof Hls;
  };

const StyledVideo = styled.video`
  width: ${({ width }) => width || '100%'};
  height: ${({ width }) => width || 'auto'};
  cursor: pointer;
  object-fit: fill;

  &:hover ~ div {
    display: flex;
  }
`;

const HlsPlayer = () => {
  const {
    playerRef,
    playingSrc,
    sources,
    posterSrc,
    updateDuration,
    updateProgress,
    pauseToggler,
    setHlsInstance,
    setPlaying,
  } = useVideoPlayerStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPoster, setShowPoster] = useState<boolean>(true);

  const handleOnCanPlayTrough = () => {
    setPlaying();
    setShowPoster(false);
  };

  const handleOnPlaying = (e: React.ChangeEvent<HTMLVideoElement>) => {
    const { currentTime, duration } = e.target;
    if (+duration > 0) {
      updateDuration(+duration);
      updateProgress(+currentTime);
      setIsLoading(false);
    }
  };

  const handleOnMetadataLoaded = (e: React.ChangeEvent<HTMLVideoElement>) => {
    const { duration } = e.target;

    updateDuration(+duration);
  };

  const defaultConfig = {
    poster: showPoster ? posterSrc : '',
    onClick: pauseToggler,
    onLoadStart: () => {
      setShowPoster(true);

      if (sources) {
        setIsLoading(true);
      }
    },
    onWaiting: () => setIsLoading(true),
    onCanPlayThrough: handleOnCanPlayTrough,
    onTimeUpdate: handleOnPlaying,
    onLoadedMetadata: handleOnMetadataLoaded,
  };

  useEffect(() => {
    let hls: Hls;

    const _initPlayer = () => {
      hls?.destroy();

      window.Hls = Hls;

      const newHls = new Hls({
        enableWorker: true,
        startLevel: -1,
      });

      if (playerRef.current != null) {
        newHls.attachMedia(playerRef.current);
      }

      // Event Docs: https://github.com/video-dev/hls.js/blob/v1.4.7/docs/API.md#runtime-events
      newHls.on(Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(sources?.[0]);

        newHls.on(Events.MANIFEST_PARSED, () => {
          setHlsInstance(newHls);
        });
        newHls.on(Events.FRAG_PARSING_METADATA, (_event, data) => {
          console.log('Data', { _event, data });
        });
      });

      newHls.on(Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case ErrorTypes.NETWORK_ERROR:
              newHls.startLoad();
              break;
            case ErrorTypes.MEDIA_ERROR:
              newHls.recoverMediaError();
              break;
            default:
              _initPlayer();
              break;
          }
        }
      });

      hls = newHls;
    };

    // Check for Media Source support
    if (Hls.isSupported()) {
      _initPlayer();
    }

    return () => {
      hls?.destroy();
    };
  }, [playerRef, setHlsInstance, sources]);

  return (
    <>
      <StyledVideo ref={playerRef} src={playingSrc} {...defaultConfig} />
      {isLoading && <Loader />}
    </>
  );
};

export default React.memo(HlsPlayer);
