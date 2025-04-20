import React, { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import useInput from '../../hooks/useInput';
import { updateUserInfo, clearUserStateStatusAndProblemMessage } from '@reducers';
import { isBlank, isNotBlank } from '@utilities';
import  { type UpdateUserDTO, type UserState, UserStateStatus } from '@models/authUser';
import type { RootDispatch, RootState } from '@redux-store';
import LabelNestingInput from '@components/input/LabelNestingInput.tsx';
import useLoadingToast from '@hooks/useLoadingToast.ts';

type StyledAuth = {
  theme: {
    grey: string;
    black: string;
    red: string;
    white: string;
    primaryColor: string;
    secondaryColor: string;
  }
};

export const StyledAuth = styled.div<StyledAuth>`
    min-width: 385px;
    max-width: 500px;
    padding: 3rem 1.5rem;
    background: ${(props) => props.theme.grey};
    border-radius: 4px;
    margin: 8% auto;

    h2 {
        margin-bottom: 1.3rem;
    }

    .input-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .input-group input:last-child {
        margin-left: 0.7rem;
    }

    input {
        overflow: hidden;
        border-radius: 3px;
        width: 100%;
        padding: 0.6rem 1.2rem;
        background: ${(props) => props.theme.black};
        border: 1px solid ${(props) => props.theme.black};
        margin-bottom: 1.5rem;
        color: ${(props) => props.theme.primaryColor};
    }

    .action {
        margin-top: 1rem;
    }

    button {
        padding: 0.4rem 1rem;
        background: ${(props) => props.theme.red};
        color: ${(props) => props.theme.white};
        border: 1px solid ${(props) => props.theme.red};
        border-radius: 3px;
        text-transform: uppercase;
        letter-spacing: 1.1px;
    }

    span {
        letter-spacing: 0.8px;
        color: ${(props) => props.theme.secondaryColor};
    }

    @media screen and (max-width: 430px) {
        margin: 20% auto;
        width: 90%;
    }
`;

const UpdateUserInfo: React.FC = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { status, problemMessage, data: user } = useSelector<RootState, UserState>((state) => state.user);
  const name = useInput(user.name);
  const username = useInput(user.username);
  const email = useInput(user.email);
  const password1 = useInput('');
  const password2 = useInput('');
  const loadingToast = useLoadingToast();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (
      isBlank(name.value) ||
      isBlank(username.value) ||
      isBlank(email.value)
    ) {
      return toast.error('Please fill in all the fields');
    }

    if (isNotBlank(password1.value) && isBlank(password2.value)) {
      return toast.error('Re-enter your password again');
    }

    if (password1.value !== password2.value) {
      return toast.error('Password does not match');
    }

    if (username.value.length < 4) {
      return toast.error('Username should be at least four-character long');
    }

    const re = /^[a-z0-9\x20]+$/i;

    if (!re.exec(username.value)) {
      return toast.error('Choose a better username');
    }

    const payload: UpdateUserDTO = {
      name: name.value,
      username: username.value,
      email: email.value,
      phoneNumber: null,
      password: password1.value || undefined,
    };

    dispatch(updateUserInfo(payload));
  }, [dispatch, email.value, name.value, password1.value, password2.value, username.value]);

  useEffect(() => {
    switch (status) {
      case UserStateStatus.IS_UPDATING_USER:
        loadingToast.show('Updating...');
        break;
      case UserStateStatus.USER_UPDATED:
        loadingToast.hide();
        toast.success('Your information has been updated');
        // dispatch(clearUserStateStatusAndProblemMessage());
        break;
      case UserStateStatus.USER_NOT_UPDATED:
        loadingToast.hide();
        toast.error(problemMessage);
        // dispatch(clearUserStateStatusAndProblemMessage());
        break;
    }
  }, [dispatch, problemMessage, status]);

  return (
    <StyledAuth>
      <h2>Update your account</h2>
      <form onSubmit={handleSubmit}>
        {/*<div className="input-group">*/}
        <LabelNestingInput
          label="Name"
          type="text"
          placeholder="firstname"
          value={name.value}
          onChange={name.onChange}
        />
        {/*</div>*/}
        <LabelNestingInput
          label="Username"
          type="text"
          placeholder="username"
          value={username.value}
          onChange={username.onChange}
        />
        <LabelNestingInput
          label="Email"
          type="email"
          placeholder="email"
          value={email.value}
          onChange={email.onChange}
        />
        <div className="input-group space-x-2">
          <LabelNestingInput
            label="Password"
            type="password"
            placeholder="password"
            value={password1.value}
            onChange={password1.onChange}
          />
          <LabelNestingInput
            label="Re-enter password"
            type="password"
            placeholder="confirm"
            value={password2.value}
            onChange={password2.onChange}
            disabled={!password1.value}
          />
        </div>
        <button className="float-end ">Save</button>
      </form>
    </StyledAuth>
  );
};

export default UpdateUserInfo;
