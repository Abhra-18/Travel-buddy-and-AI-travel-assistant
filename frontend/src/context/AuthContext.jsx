import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('travelmate-token');
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('travelmate-token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('travelmate-token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('travelmate-token');
      setUser(null);
    }
  };

  const updateUser = (userDataOrFn) => {
    if (typeof userDataOrFn === 'function') {
      setUser(prev => userDataOrFn(prev));
    } else {
      setUser(userDataOrFn);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
