// src/components/Login.js
import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
        navigate('/home');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
        navigate('/home');
      })
      .catch((error) => {
        console.error(error);
        alert('Login failed. Please check your credentials.');
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to the Online Voting System</h2>
        <form onSubmit={handleEmailSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="divider">OR</div>
        <button onClick={handleGoogleSignIn} className="google-button">
          Sign in with Google
        </button>
        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
