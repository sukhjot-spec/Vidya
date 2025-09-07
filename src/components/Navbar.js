import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, BookOpen, LogOut, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand" aria-label="Vidya Home">
            <BookOpen className="navbar-logo" aria-hidden="true" />
            <span className="navbar-title">Vidya</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav-desktop">
            <Link to="/courses" className="nav-link">
              Courses
            </Link>
            {user && (
              <Link to="/recommendations" className="nav-link">
                Recommendations
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="navbar-actions">
            {user ? (
              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={toggleProfile}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <img
                    src={user.avatar}
                    alt={`${user.name} profile`}
                    className="user-avatar"
                  />
                  <span className="user-name">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-info">
                      <img
                        src={user.avatar}
                        alt={`${user.name} profile`}
                        className="dropdown-avatar"
                      />
                      <div>
                        <div className="user-name-dropdown">{user.name}</div>
                        <div className="user-type">{user.userType}</div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link
                      to={user.userType === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                      className="dropdown-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="dropdown-icon" aria-hidden="true" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="dropdown-icon" aria-hidden="true" />
                      Profile Settings
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <LogOut className="dropdown-icon" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="navbar-nav-mobile" role="menu">
            <Link
              to="/courses"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            {user && (
              <>
                <Link
                  to="/recommendations"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Recommendations
                </Link>
                <Link
                  to={user.userType === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="mobile-nav-link logout-mobile"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
