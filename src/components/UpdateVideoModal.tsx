import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import CustomButton from '../styles/Button';
import { CloseIcon } from './Icons';
import useInput from '../hooks/useInput';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { type UserState } from '@models/authUser';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import LabelNestingInput from '@components/input/LabelNestingInput.tsx';
import { Share2, X } from 'lucide-react';
import { ConciseVideoData, VideoUpdateType, VideoVisibilityEnum } from '@models/video.ts';
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { RadioButtonChecked, RadioButtonUnchecked } from '@mui/icons-material';
import SingleImageInputArea from '@components/input/SingleImageInputArea.tsx';
import { videoResource } from '@api';
import { isBlank, uploadImmediate } from '@utilities';

const openModal = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const Wrapper = styled.div<StyledComponentProps>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 900;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.7);
    animation: ${openModal} 0.5s ease-in-out;

    .modal-content {
        width: 720px;
        margin: 4rem auto;
        background: ${(props) => props.theme.grey};
        border-radius: 3px;
        box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.4), 0px 0px 4px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
    }

    .modal-header-left {
        display: flex;
        align-items: center;
    }

    .modal-header-left svg {
        margin-right: 1rem;
        position: relative;
        fill: ${(props) => props.theme.red};
        top: -1px;
    }

    .video-form {
        border-top: 1px solid ${(props) => props.theme.darkGrey};
        border-bottom: 1px solid ${(props) => props.theme.darkGrey};
        padding: 0.5rem 1rem;
    }

    .video-form h2 {
        margin: 1rem 0;
    }

    .video-form input,
    .video-form textarea {
        // width: 66.25%;
        width: 95%;
        background: ${(props) => props.theme.black};
        border: 1px solid ${(props) => props.theme.darkGrey};
        color: ${(props) => props.theme.primaryColor};
        padding: 0.6rem 1.2rem;
        margin-bottom: 1.2rem;
        border-radius: 3px;
    }

    .video-form input {
        height: 60px;
    }

    .video-form textarea {
        height: 120px;
    }

    .modal-footer {
        display: flex;
        height: 70px;
        padding: 1rem;
    }

    button {
        margin-left: auto;
    }

    img {
        width: 100%;
        height: 340px;
        object-fit: cover;
    }

    svg {
        width: 30px;
        height: 30px;
        fill: ${(props) => props.theme.red};
    }

    @media screen and (max-width: 835px) {
        .modal-content,
        .modal-content input,
        .modal-content textarea {
            width: 90%;
        }

        .modal-content {
            margin-top: 7rem;
        }
    }

    @media screen and (max-width: 400px) {
        background: rgba(0, 0, 0, 0.9);
    }
`;

enum Tab {
  PREVIEW,
  FORM,
}

const visibilityOptions = [
  {
    value: VideoVisibilityEnum.PUBLIC,
    label: 'Public',
    description: 'Everyone can watch your video',
  },
  {
    value: VideoVisibilityEnum.UNLISTED,
    label: 'Unlisted',
    description: 'Anyone with the video link can watch your video',
  },
  {
    value: VideoVisibilityEnum.PRIVATE,
    label: 'Private',
    description: 'Only you and people you choose can watch your video',
    action: (
      <Button
        variant="outlined"
        size="small"
        className="ml-6 bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share privately
      </Button>
    ),
  },
];

type Props = {
  video: ConciseVideoData,
  // source: { src: string, type: string },
  closeModal: () => void,
};

const UpdateVideoModal: React.FC<Props> = ({ video, closeModal }) => {
  const dispatch = useDispatch<RootDispatch>();
  const title = useInput(video.title);
  const description = useInput(video.description);
  const [isSettingThumbnail, setIsSettingThumbnail] = useState<boolean>(isBlank(video.thumbnail));
  const [thumbnailFile, setThumbnailFile] = useState<File>();
  const [focused, setFocused] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<VideoVisibilityEnum>(video.visibility);

  const handleSubmit = useCallback(async () => {
    if (isBlank(title.value)) {
      return toast.error('Fill the video\'s title!');
    }

    const createVideoResponse = await videoResource.update(video.code, {
      updateType: VideoUpdateType.UPDATE_INFO,
      title: title.value,
      description: description.value,
      visibility,
      allowsComment: true,
    });

    if (!createVideoResponse.ok) {
      if (createVideoResponse.problem == 'CLIENT_ERROR') {
        toast.error('Cannot update video. Check the form and try later.');
      } else {
        toast.error('Cannot update video. Try again later.');
      }

      return;
    }

    if (thumbnailFile) {
      await uploadImmediate(
        thumbnailFile,
        (formData, config) => videoResource.uploadThumbnail(createVideoResponse.data.data.id, formData, config).then((res) => {
          if (!res.ok) {
            if (res.problem == 'CLIENT_ERROR') {
              toast.error('Cannot upload thumbnail.');
            } else {
              toast.error('Cannot upload thumbnail. Try again later.');
            }

            throw res.originalError;
          }
        }),
      );
    }

    toast.success('Video has been updated!');
    closeModal();
  }, [closeModal, description.value, thumbnailFile, title.value, video.code, visibility]);

  return (
    <Wrapper>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-left">
            <CloseIcon onClick={() => closeModal()} />
            <h3>Update Video</h3>
          </div>
          <div className="flex space-x-2">
            <CustomButton onClick={handleSubmit}>
              Update
            </CustomButton>
          </div>
        </div>

        <div className="tab video-form">
          <h5 className="my-2 text-lg font-semibold text-gray-100">
            Thumbnail {/*<span className="text-sm font-light">(automatically set if not specified)</span>*/}
          </h5>
          {video.thumbnail && !isSettingThumbnail && (
            <div className="flex space-x-8">
              <div className="w-64 h-36 mb-2">
                <img src={video.thumbnail} alt="Thumbnail" className="block w-auto h-auto max-h-full mx-auto" />
              </div>
              <X onClick={() => setIsSettingThumbnail(true)} className="top-0 w-4 h-4 rounded-md " />
            </div>
          )}
          {isSettingThumbnail && (
            <SingleImageInputArea onChange={setThumbnailFile} className="w-64 h-36 mb-2" />
          )}

          <h5 className="my-4 text-lg font-semibold text-gray-100">Details</h5>
          <LabelNestingInput
            label="Title (required)"
            type="text"
            value={title.value}
            required
            onChange={title.onChange}
          />
          <div className="relative min-h-16 mb-4">
              <textarea
                value={description.value}
                onChange={description.onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full px-3 pt-6 pb-2 text-sm bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell viewers about your video"
              />
            <label
              className={`absolute left-3 transition-all text-sm ${
                'top-1 text-xs text-gray-400'
                // focused
                // ? 'top-1 text-xs text-blue-400'
                // : 'top-3.5 text-gray-400'
              } pointer-events-none`}
            >
              Description
            </label>
          </div>

          <FormControl>
            <FormLabel className="text-lg font-semibold text-gray-100">Save or publish</FormLabel>
            <p className="text-sm text-gray-400 mb-6">Make your video public, unlisted, or private</p>
            <RadioGroup
              // defaultValue={VideoVisibility.PUBLIC}
              name="visibility"
              // className="space-y-4"
              onChange={(e, value) => setVisibility(Number(value))}
            >
              {visibilityOptions.map((option, index) => (
                <div key={index} className="space-y-1">
                  <FormControlLabel
                    value={option.value}
                    control={<Radio size="small" checked={visibility == option.value} className="m-0"
                                    icon={<RadioButtonUnchecked className="mr-2" />}
                                    checkedIcon={<RadioButtonChecked className="mr-2" />} />}
                    label={
                      <div className="">
                        <Typography variant="body1" className="text-gray-200">
                          {option.label}
                        </Typography>
                        <Typography variant="caption" className="text-gray-400">
                          {option.description}
                        </Typography>
                      </div>
                    }
                    className="mb-1 ml-0"
                  />
                  {/*{option.value === VideoVisibility.PRIVATE && selectedPrivacy === 'private' && (*/}
                  {/*  <Button*/}
                  {/*    variant="outlined"*/}
                  {/*    size="small"*/}
                  {/*    className="ml-8 bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 flex items-center gap-2"*/}
                  {/*  >*/}
                  {/*    <Share className="w-4 h-4" />*/}
                  {/*    Share privately*/}
                  {/*  </Button>*/}
                  {/*)}*/}
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    </Wrapper>
  );
};

export default UpdateVideoModal;
