import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import { CloseIcon } from '@components/Icons';
import Button from '@styles/Button';
import useInput from '@hooks/useInput';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { clearUserStateStatusAndProblemMessage, createChannel } from '@reducers';
import LabelNestingInput from '@components/input/LabelNestingInput.tsx';
import LabelNestingTextArea from '@components/input/LabelNestingTextArea';
import { UserState, UserStateStatus } from '@models/authUser.ts';
import { isNotBlank } from '@utilities';
import { useNavigate } from 'react-router';
import { ROUTES } from '@constants';
import defaultAvatar from '@assets/default-avatar.svg';
import useLoadingToast from '@hooks/useLoadingToast.ts';

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
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 900;
    background: rgba(0, 0, 0, 0.7);
    animation: ${openModal} 0.3s ease-in-out;

    .modal {
        width: 600px;
        border-radius: 4px;
        background: ${(props) => props.theme.grey};
        margin: 12rem auto;
        box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.4), 0px 0px 4px rgba(0, 0, 0, 0.25);
    }

    .modal img {
        object-fit: cover;
    }

    div.modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid ${(props) => props.theme.darkGrey};
    }

    h3 {
        display: flex;
        align-items: center;
    }

    form {
        padding: 1rem;
    }

    input,
    textarea {
        width: 100%;
        background: ${(props) => props.theme.black};
        border: 1px solid ${(props) => props.theme.black};
        margin-bottom: 1rem;
        padding: 0.6rem 1rem;
        border-radius: 3px;
        color: ${(props) => props.theme.primaryColor};
    }

    textarea {
        height: 75px;
    }

    svg {
        fill: ${(props) => props.theme.red};
        height: 22px;
        width: 22px;
        margin-right: 1rem;
        position: relative;
        top: -1px;
    }

    @media screen and (max-width: 600px) {
        .modal {
            width: 90%;
            margin: 4rem auto;
        }
    }

    @media screen and (max-width: 400px) {
        background: rgba(0, 0, 0, 0.9);
    }
`;

type Props = {
  closeModal: () => void;
  redirectsToChannelPage?: boolean;
};

const UpdateChannelModal: React.FC<Props> = ({ closeModal, redirectsToChannelPage = true }) => {
  const dispatch = useDispatch<RootDispatch>();
  const { status, problemMessage, data: user } = useSelector<RootState, UserState>((state) => state.user);

  const name = useInput('');
  const pathname = useInput(user.username);
  const description = useInput('');
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [avatarFile, setAvatarFile] = useState<File>();
  const loadingToast = useLoadingToast();
  const navigate = useNavigate();

  const handleAvatarUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];

    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.value.trim()) {
      return toast.error('name should not be empty');
    }

    dispatch(createChannel({
      name: name.value,
      pathname: pathname.value,
      description: description.value,
      avatarFile: avatarFile,
    }));
  }, [dispatch, name.value, pathname.value, description.value, avatarFile]);

  useEffect(() => {
    switch (status) {
      case UserStateStatus.IS_CREATING_CHANNEL:
        loadingToast.show('Creating...');
        break;
      case UserStateStatus.CHANNEL_CREATED: {
        loadingToast.hide();
        toast.success('Channel created!');

        // In case uploading avatar fails
        if (problemMessage && isNotBlank(problemMessage)) {
          toast.error(problemMessage);
        }


        if (redirectsToChannelPage) {
          setTimeout(() => {
            closeModal();
            navigate(`${ROUTES.CHANNEL}/${user.ownedChannel.pathname}`);
          }, 1000);
        } else {
          closeModal();
        }

        dispatch(clearUserStateStatusAndProblemMessage());
        break;
      }
      case UserStateStatus.CHANNEL_NOT_CREATED:
        // TODO: fix the error where this toast is presented twice.
        loadingToast.hide();
        toast.error(problemMessage);
        dispatch(clearUserStateStatusAndProblemMessage());
        break;
    }

    return () => {
      // In fact, this does not help to avoid re-rendering toast in case dependencies are updated.
      // This even may cause the toasts to be shown multiple times.
      // dispatch(clearUserStateStatusAndProblemMessage());
    };
  }, [closeModal, redirectsToChannelPage, dispatch, navigate, problemMessage, status, user?.ownedChannel?.pathname]);

  return (
    <Wrapper>
      <div className="modal">
        <div className="modal-header">
          <h3>
            <CloseIcon onClick={() => closeModal()} />
            <span>Create channel</span>
          </h3>
          <Button onClick={handleSubmit}>Save</Button>
        </div>

        {/*<div className="cover-upload-container ">*/}
        {/*  <label htmlFor="cover-upload">*/}
        {/*    {(cover ?? channel.cover) ? (*/}
        {/*      <img*/}
        {/*        className="pointer"*/}
        {/*        width="100%"*/}
        {/*        height="200px"*/}
        {/*        src={cover ?? channel.cover}*/}
        {/*        alt="cover"*/}
        {/*      />*/}
        {/*    ) : <Button>Upload cover</Button>}*/}
        {/*  </label>*/}
        {/*  <input*/}
        {/*    id="cover-upload"*/}
        {/*    type="file"*/}
        {/*    accept="image/*"*/}
        {/*    onChange={handleCoverUpload}*/}
        {/*    style={{ display: 'none' }}*/}
        {/*  />*/}
        {/*</div>*/}

        <form>
          <div className="flex mb-2 items-center space-x-2">
            <div className="avatar-upload-icon w-1/6 h-20">
              <label htmlFor="avatar-upload" className="block w-full h-full avatar-upload cursor-pointer">
                <img
                  src={(avatarUrl && isNotBlank(avatarUrl)) ? avatarUrl : defaultAvatar}
                  className="w-full aspect-square rounded-full"
                  alt="avatar"
                />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <LabelNestingInput
              label={'Channel name (required)'}
              type="text"
              placeholder="Channel name"
              value={name.value}
              onChange={name.onChange}
              // className="my-auto"
            />
          </div>
          {/*<label htmlFor="pathname">Pathname (optional): </label>*/}
          {/*<input*/}
          {/*  type="text"*/}
          {/*  name="pathname"*/}
          {/*  placeholder="pathname"*/}
          {/*  value={pathname.value}*/}
          {/*  onChange={pathname.onChange}*/}
          {/*/>*/}
          <LabelNestingInput
            label="Pathname"
            type="text"
            value={pathname.value}
            required
            onChange={pathname.onChange}
          />

          {/*<label htmlFor="description">Description: </label>*/}
          <LabelNestingTextArea
            label="Description"
            placeholder="Tell viewers about your channel"
            value={description.value}
            onChange={description.onChange}
            // className="h-30"
          />
        </form>
      </div>
    </Wrapper>
  );
};

export default UpdateChannelModal;
