import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Validate token with backend
          const response = await api.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login for:', email);
      setLoading(true);
      const response = await api.login({ email, password });
      console.log('AuthContext: API response:', response);
      
      if (response.success) {
        console.log('AuthContext: Login successful, setting user state');
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('AuthContext: User state set, token stored');
        return { success: true };
      } else {
        console.log('AuthContext: Login failed:', response.message);
        return { success: false, error: response.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      console.log('AuthContext: Starting signup for:', userData.email);
      setLoading(true);
      const response = await api.register(userData);
      console.log('AuthContext: Signup API response:', response);
      
      if (response.success) {
        console.log('AuthContext: Signup successful, setting user state');
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('AuthContext: User state set after signup');
        return { success: true };
      } else {
        console.log('AuthContext: Signup failed:', response.message);
        return { success: false, error: response.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Signup failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local state
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await api.updateProfile(updatedData);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
