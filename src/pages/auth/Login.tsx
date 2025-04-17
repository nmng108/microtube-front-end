import React, { FormEvent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, redirect, useNavigate } from 'react-router';
import { StyledAuth } from './Signup.tsx';
import useInput from '../../hooks/useInput';
import { login } from '@reducers';
import { type LoginRequestBody, UserStateData } from '@models/authUser.ts';
import { RootDispatch, type RootState } from '@redux-store.ts';
import { ROUTES } from '../../constants';

const Login = () => {
  const dispatch = useDispatch<RootDispatch>();
  const username = useInput('');
  const password = useInput('');

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
        <input
          type="text"
          placeholder="username"
          value={username.value}
          onChange={username.onChange}
        />
        <input
          type="password"
          placeholder="password"
          value={password.value}
          onChange={password.onChange}
        />
        <div className="action input-group">
          <Link to={ROUTES.AUTH_REGISTER} className="pointer">Register</Link>
          <button>Login</button>
        </div>
      </form>
    </StyledAuth>
  );
};

export default Login;
