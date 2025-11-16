import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';  // Use the same CSS as RegisterPage for consistency

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = 'http://localhost:5000/api/auth/login';

      const response = await axios.post(API_URL, {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('authToken', token);

      console.log('Login Successful, Token:', token);
      setSuccess('Login successful! Redirecting...');
      setEmail('');
      setPassword('');

      // TODO: redirect using react-router
      // navigate('/dashboard');

    } catch (err) {
      console.error('Login Error:', err);

      if (err.response) {
        setError(err.response.data.message || 'Invalid email or password.');
      } else if (err.request) {
        setError('Cannot connect to the server.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
