import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await authApi.getProfile();
      // getProfile() trả { user: {...} } (wrapped bởi transform.interceptor)
      // login() đã xử lý đúng: data.user || data — áp dụng nhất quán ở đây
      setUser(profile.user ?? profile);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('accessToken', tokenFromUrl);
      setAccessToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [accessToken]);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApi.login({ email, password });
      
      const token = data.accessToken || data.token;
      if (token) {
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
      }
      
      const userProfile = data.user || data;
      setUser(userProfile);
      return userProfile;
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApi.register({ email, password, fullName });
      return data;
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  const deleteAccount = async (password) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await userApi.deleteMyAccount(password);
      logout();
      return res;
    } catch (err) {
      setError(err.message || 'Xoá tài khoản thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    error,
    login,
    register,
    logout,
    deleteAccount,
    refreshUser: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
