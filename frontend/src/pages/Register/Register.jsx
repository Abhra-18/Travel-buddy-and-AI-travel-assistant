import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id.replace('register-', '')]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await API.post('/auth/register', formData);
      if (data.success) {
        login(data.data, data.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-page" className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__header">
          <span className="auth-card__icon">🌍</span>
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__subtitle">Join thousands of smart travelers</p>
        </div>

        {error && <div className="auth-card__error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              type="text"
              id="register-name"
              className="form-input"
              placeholder="John Doe"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              type="email"
              id="register-email"
              className="form-input"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              className="form-input"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <button id="register-submit-btn" type="submit" className="btn btn-primary auth-form__submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
