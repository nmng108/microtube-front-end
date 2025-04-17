// import React, { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import videojs from 'video.js';
// import 'video.js/dist/video-js.css';
// import type { RootDispatch, RootState } from '../redux-store.ts';
// import { DetailFormatVideo } from '../models/video.ts';
// import Player from 'video.js/dist/types/player';
//
// type Props = {
//   options: {
//     autoplay: boolean,
//     controls: boolean,
//     responsive: boolean,
//     fluid: boolean,
//     sources: Array<{ src: string, type: string }>,
//   },
//   onReady?: (player: Player) => void;
// }
//
// const VideoJsPlayer: React.FC<Props> = ({ options, onReady }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);
//
//   const dispatch = useDispatch<RootDispatch>();
//   // const { id: videoId, url: src, thumbnail: poster } = useSelector<RootState, DetailFormatVideo>(
//   //   (state) => state.video.data,
//   // );
//
//   useEffect(() => {
//     if (!videoRef.current || !document.body.contains(videoRef.current) || playerRef.current) return;
//
//     const videoElement = document.createElement('video-js');
//
//     videoElement.classList.add('vjs-big-play-centered', 'vjs-fluid', 'video-js');
//     videoRef.current.appendChild(videoElement);
//
//     const vjsPlayer = videojs(videoElement, options, () => {
//       videojs.log('player is ready');
//       if (onReady) onReady(vjsPlayer);
//     });
//     playerRef.current = vjsPlayer;
//
//     if (options.sources?.length > 0) {
//       // vjsPlayer.poster(poster);
//       vjsPlayer.src(options.sources);
//       vjsPlayer.src(options.autoplay);
//     }
//
//     // vjsPlayer.on('ended', () => {
//     //   client(`${process.env.REACT_APP_BE}/videos/${videoId}/view`);
//     // });
//
//     return () => {
//       if (vjsPlayer && !vjsPlayer.isDisposed()) {
//         vjsPlayer.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [dispatch, onReady, options, videoRef]);
//
//   // Dispose the Video.js player when the functional component unmounts
//   React.useEffect(() => {
//     const player = playerRef.current;
//
//     return () => {
//       if (player && !player.isDisposed()) {
//         player.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [playerRef]);
//
//   return (
//     <div data-vjs-player>
//       <div
//         // controls
//         ref={videoRef}
//         // className="video-js vjs-fluid vjs-big-play-centered"
//       ></div>
//     </div>
//   );
// };
//
// export default VideoJsPlayer;
