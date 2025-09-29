import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserInfo = (newUserInfo) => {
    if (!newUserInfo) {
      setUserInfo(null);
      localStorage.removeItem('userInfo');
      delete api.defaults.headers.common['Authorization'];
      return;
    }

    // Ensure we have both token and refreshToken
    const userData = {
      ...newUserInfo,
      token: newUserInfo.token,
      refreshToken: newUserInfo.refreshToken
    };

    setUserInfo(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    
    if (userData.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/users/login', { email, password });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      updateUserInfo(response.data);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return { 
          success: false, 
          message: 'Unable to connect to server. Please check if the server is running.'
        };
      }
      
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Invalid email or password'
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/api/users/register', {
        name,
        email,
        password,
      });
      
      updateUserInfo(data);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    updateUserInfo(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          
          // Set the token in the API headers
          if (parsedUserInfo.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${parsedUserInfo.token}`;
          }
          
          try {
            // Verify token is still valid
            const { data } = await api.get('/api/users/profile');
            updateUserInfo({ ...parsedUserInfo, ...data });
          } catch (error) {
            if (error.response?.status === 401) {
              // Token expired, try to refresh
              try {
                const response = await api.post('/api/users/refresh-token', {
                  refreshToken: parsedUserInfo.refreshToken
                });
                
                if (response.data.token) {
                  updateUserInfo({
                    ...parsedUserInfo,
                    token: response.data.token,
                    refreshToken: response.data.refreshToken
                  });
                } else {
                  updateUserInfo(null);
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                updateUserInfo(null);
              }
            } else {
              console.error('Token verification failed:', error);
              updateUserInfo(null);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        updateUserInfo(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add token refresh interval
  useEffect(() => {
    if (!userInfo) return;

    const refreshInterval = setInterval(async () => {
      try {
        const response = await api.post('/api/users/refresh-token', {
          refreshToken: userInfo.refreshToken
        });
        
        if (response.data.token) {
          updateUserInfo({
            ...userInfo,
            token: response.data.token,
            refreshToken: response.data.refreshToken
          });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        updateUserInfo(null);
      }
    }, 23 * 60 * 60 * 1000); // Refresh every 23 hours

    return () => clearInterval(refreshInterval);
  }, [userInfo]);

  const sendEmailVerification = async () => {
    try {
      await api.post('/users/verify/resend');
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send verification email' 
      };
    }
  };

  const verifyEmail = async (code) => {
    try {
      await api.get(`/users/verify/${code}`);
      setIsEmailVerified(true);
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email verification failed' 
      };
    }
  };

  const enable2FA = async () => {
    try {
      await api.post('/users/2fa/enable');
      setIs2FAEnabled(true);
      return { success: true, message: '2FA enabled successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to enable 2FA' 
      };
    }
  };

  const disable2FA = async () => {
    try {
      await api.post('/users/2fa/disable');
      setIs2FAEnabled(false);
      return { success: true, message: '2FA disabled successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to disable 2FA' 
      };
    }
  };

  const verify2FA = async (code) => {
    try {
      await api.post('/users/2fa/verify', { code });
      return { success: true, message: '2FA verification successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '2FA verification failed' 
      };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update password' 
      };
    }
  };

  const removeDevice = async (deviceId) => {
    try {
      await api.delete(`/users/devices/${deviceId}`);
      setDeviceList(deviceList.filter(device => device.id !== deviceId));
      return { success: true, message: 'Device removed successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove device' 
      };
    }
  };

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        isEmailVerified,
        is2FAEnabled,
        deviceList,
        isLoading,
        login,
        register,
        logout,
        updateUserInfo,
        sendEmailVerification,
        verifyEmail,
        enable2FA,
        disable2FA,
        verify2FA,
        updatePassword,
        removeDevice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 