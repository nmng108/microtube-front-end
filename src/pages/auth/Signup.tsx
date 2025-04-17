import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import useInput from '../../hooks/useInput';
import { signup } from '@reducers';
import { isBlank } from '@utilities';
import { type SignupRequestBody } from '@models/authUser';
import { type RootDispatch } from '@redux-store';
import { ROUTES } from '../../constants';
import { Link, redirect } from 'react-router';

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

const Signup: React.FC = () => {
  const dispatch = useDispatch<RootDispatch>();

  const firstname = useInput('');
  const lastname = useInput('');
  const username = useInput('');
  const email = useInput('');
  const password1 = useInput('');
  const password2 = useInput('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (
      isBlank(firstname.value) ||
      isBlank(lastname.value) ||
      isBlank(username.value) ||
      isBlank(email.value) ||
      isBlank(password1.value) ||
      isBlank(password2.value)
    ) {
      return toast.error('Please fill in all the fields');
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

    const payload: SignupRequestBody = {
      username: username.value,
      password: password1.value,
      name: `${firstname.value}  ${lastname.value}`,
      email: email.value,
      phoneNumber: null,
    };

    const clearForm = () => {
      username.setValue('');
      firstname.setValue('');
      lastname.setValue('');
      email.setValue('');
      password1.setValue('');
      password2.setValue('');
    };

    dispatch(signup({ payload, clearForm }));
    redirect(ROUTES.INDEX);
  }, [dispatch, email, firstname, lastname, password1, password2, username]);

  return (
    <StyledAuth>
      <h2>Create your account</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder="firstname"
            value={firstname.value}
            onChange={firstname.onChange}
          />
          <input
            type="text"
            placeholder="lastname"
            value={lastname.value}
            onChange={lastname.onChange}
          />
        </div>
        <input
          type="text"
          placeholder="username"
          value={username.value}
          onChange={username.onChange}
        />
        <input
          type="email"
          placeholder="email"
          value={email.value}
          onChange={email.onChange}
        />
        <div className="input-group">
          <input
            type="password"
            placeholder="password"
            value={password1.value}
            onChange={password1.onChange}
          />
          <input
            type="password"
            placeholder="confirm"
            value={password2.value}
            onChange={password2.onChange}
          />
        </div>
        <div className="action input-group">
          You've already had an account?
          <Link to={ROUTES.AUTH_LOGIN} className="pointer">
            Sign in
          </Link>
          <button>Sign Up</button>
        </div>
      </form>
    </StyledAuth>
  );
};

export default Signup;
