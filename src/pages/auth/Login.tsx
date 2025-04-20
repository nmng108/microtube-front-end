import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router';
import { StyledAuth } from './Signup';
import useInput from '@hooks/useInput';
import { login } from '@reducers';
import { type LoginRequestBody, UserState, UserStateStatus } from '@models/authUser';
import { RootDispatch, type RootState } from '@redux-store';
import { ROUTES } from '../../constants';
import LabelNestingInput from '@components/input/LabelNestingInput';

const Login = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { status, problemMessage } = useSelector<RootState, UserState>((state) => state.user);
  const username = useInput('');
  const password = useInput('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLogin = useCallback((e: FormEvent) => {
    e.preventDefault();

    if (!username.value.trim() || !password.value.trim()) {
      return toast.error('Please fill in all the fields');
    }

    const payload: LoginRequestBody = {
      username: username.value,
      password: password.value,
    };

    const clearForm = () => {
      username.setValue('');
      password.setValue('');
    };

    dispatch(login({ payload, clearForm }));
  }, [dispatch, password, username]);

  useEffect(() => {
    switch (status) {
      case UserStateStatus.IS_LOGGING_IN:
        setIsLoggingIn(true);
        break;
      case UserStateStatus.LOGIN_SUCCEEDED:
        setIsLoggingIn(false);
        toast.success('Logged in!');
        break;
      case UserStateStatus.LOGIN_FAILED:
        setIsLoggingIn(false);
        toast.error(problemMessage);
        break;
    }
  }, [dispatch, problemMessage, status]);

  // Why does this not work if placed in this component, while it functions in the parent Auth?
  // useEffect(() => {
  //   if (storedUsername) {
  //     navigate(ROUTES.INDEX);
  //     console.log('run redirect');
  //   }
  // }, [navigate, storedUsername]);

  return (
    <StyledAuth>
      <h2>Login to your account</h2>
      <form onSubmit={handleLogin}>
        <LabelNestingInput
          label="Username"
          type="text"
          placeholder="username"
          value={username.value}
          onChange={username.onChange}
        />
        <LabelNestingInput
          label="Password"
          type="password"
          placeholder="password"
          value={password.value}
          onChange={password.onChange}
        />
        <div className="action input-group">
          <Link to={ROUTES.AUTH_REGISTER} className="pointer">Register</Link>
          <button disabled={isLoggingIn} className={isLoggingIn ? 'bg-gray-700' : ''}>Login</button>
        </div>
      </form>
    </StyledAuth>
  );
};

export default Login;
