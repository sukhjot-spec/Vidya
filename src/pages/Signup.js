import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });
      
      if (result.success) {
        console.log('Signup successful, navigating based on user type');
        // Redirect based on user type
        const userType = formData.userType;
        if (userType === 'student') {
          window.location.href = '/student-dashboard';
        } else if (userType === 'teacher') {
          window.location.href = '/teacher-dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Join Vidya</h1>
          <p className="auth-subtitle">
            Create your account and start your learning journey today
          </p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <AlertCircle className="error-icon" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <div className="input-container">
              <User className="input-icon" aria-hidden="true" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
                autoComplete="name"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-container">
              <Mail className="input-icon" aria-hidden="true" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
                autoComplete="email"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="userType" className="form-label">
              I am a
            </label>
            <div className="radio-group">
              <label className="radio-container">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={formData.userType === 'student'}
                  onChange={handleChange}
                  className="radio"
                />
                <span className="radio-label">Student</span>
              </label>
              <label className="radio-container">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={formData.userType === 'teacher'}
                  onChange={handleChange}
                  className="radio"
                />
                <span className="radio-label">Teacher</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-container">
              <Lock className="input-icon" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password"
                required
                autoComplete="new-password"
                aria-describedby={error ? "error-message" : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="password-requirements">
              <p className="requirement-text">Password must be at least 6 characters long</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-container">
              <Lock className="input-icon" aria-hidden="true" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                aria-describedby={error ? "error-message" : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="checkbox"
                required
              />
              <span className="checkbox-label">
                I agree to the{' '}
                <Link to="/terms" className="terms-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="terms-link">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            aria-describedby={error ? "error-message" : undefined}
          >
            {loading ? (
              <LoadingSpinner size="small" message="" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="demo-credentials">
          <h3 className="demo-title">Quick Demo</h3>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  name: 'Demo Student',
                  email: 'student@demo.com',
                  password: 'password123',
                  confirmPassword: 'password123',
                  userType: 'student',
                  agreeToTerms: true
                }));
              }}
            >
              Fill Student Form
            </button>
            <button
              type="button"
              className="demo-button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  name: 'Demo Teacher',
                  email: 'teacher@demo.com',
                  password: 'password123',
                  confirmPassword: 'password123',
                  userType: 'teacher',
                  agreeToTerms: true
                }));
              }}
            >
              Fill Teacher Form
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
