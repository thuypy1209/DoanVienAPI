'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse } from '../types';
import { authApi } from '../api/authApi';
import { sinhVienApi } from '../api/sinhVienApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: 'Admin' | 'SinhVien' | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  const role: 'Admin' | 'SinhVien' | null = user?.role || (user?.mssv === 'ADMIN' ? 'Admin' : (user ? 'SinhVien' : null));
  const isAuthenticated = !!token;
  const isAdmin = role === 'Admin';

  const refreshProfile = async () => {
    if (!token) return;
    try {
      if (user?.role === 'SinhVien' || (user && user.mssv !== 'ADMIN')) {
        const profile = await sinhVienApi.getMe();
        const updated: User = { ...profile, role: 'SinhVien' };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch {
      // Token expired or invalid
    }
  };

  useEffect(() => {
    if (token && user?.mssv !== 'ADMIN') {
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const data = await authApi.login(username, password);
    setToken(data.token);
    localStorage.setItem('token', data.token);

    const detectedRole: 'Admin' | 'SinhVien' = data.role === 'Admin' || username === 'admin' ? 'Admin' : 'SinhVien';
    const newUser: User = {
      mssv: data.mssv || username,
      hoTen: data.hoTen || (detectedRole === 'Admin' ? 'Quản Trị Viên' : username),
      lop: data.lop,
      role: detectedRole,
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshProfile,
        loading,
      }}
    >
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
