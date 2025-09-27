import React, { createContext, useContext, useState, useEffect } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load user from storage on app start
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await localforage.getItem('oceanwatch_user');
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    // Mock authentication - in real app, this would call API
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (credentials.email && credentials.password) {
          // Mock user data - in real app, this would come from server
          const mockUser = {
            id: 'u1',
            name: 'Asha R.',
            email: credentials.email,
            handle: 'asha_coast',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
            bio: 'Fisherfolk·Citizen Scientist·Coastal Watch',
            trust_rating: 78,
            location: 'Chennai, India',
            reports_count: 23,
            verified: true,
            joined: '2024-01-15T00:00:00+05:30'
          };

          try {
            await localforage.setItem('oceanwatch_user', mockUser);
            setUser(mockUser);
            setIsAuthenticated(true);
            resolve(mockUser);
          } catch (error) {
            reject(new Error('Failed to save user data'));
          }
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000); // Simulate network delay
    });
  };

  const register = async (userData) => {
    // Mock registration
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const newUser = {
          id: `u_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          handle: userData.handle || userData.email.split('@')[0],
          avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces`,
          bio: userData.bio || 'Ocean guardian and environmental advocate',
          trust_rating: 50, // New users start with moderate trust
          location: userData.location || 'India',
          reports_count: 0,
          verified: false,
          joined: new Date().toISOString()
        };

        try {
          await localforage.setItem('oceanwatch_user', newUser);
          setUser(newUser);
          setIsAuthenticated(true);
          resolve(newUser);
        } catch (error) {
          reject(new Error('Failed to create user account'));
        }
      }, 1000);
    });
  };

  const logout = async () => {
    try {
      await localforage.removeItem('oceanwatch_user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    
    try {
      await localforage.setItem('oceanwatch_user', updatedUser);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
