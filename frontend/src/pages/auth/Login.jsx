// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../app/authSlice';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(credentials));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;