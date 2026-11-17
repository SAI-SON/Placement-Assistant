'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  target_role?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'placement_assistant_jwt';
const USER_KEY = 'placement_assistant_user';

function getApiEndpoint(endpoint: string): string {
  const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${backendBase}/api${endpoint}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore user session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with backend silently in background
        fetch(getApiEndpoint('/auth/me'), {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data) {
              setUser(data.data);
              localStorage.setItem(USER_KEY, JSON.stringify(data.data));
            } else {
              logout();
            }
          })
          .catch(() => {
            // Offline fallback
          });
      }
    } catch (e) {
      console.error('Failed to load session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(getApiEndpoint('/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        res = await fetch('/api/backend/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to sign in.' };
      }

      const { user: authedUser, token: authToken } = data.data;
      setUser(authedUser);
      setToken(authToken);

      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authedUser));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(getApiEndpoint('/auth/signup'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
      } catch {
        res = await fetch('/api/backend/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      const { user: newUser, token: authToken } = data.data;
      setUser(newUser);
      setToken(authToken);

      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend.' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!token) {
      return { success: false, error: 'You must be signed in to update your profile.' };
    }

    try {
      let res;
      try {
        res = await fetch(getApiEndpoint('/auth/profile'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      } catch {
        res = await fetch('/api/backend/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      }

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Failed to update profile.' };
      }

      const updatedUser = resData.data;
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return { success: true, message: resData.message || 'Profile saved successfully!' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile.' };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'You must be signed in to change your password.' };
    }

    try {
      let res;
      try {
        res = await fetch(getApiEndpoint('/auth/change-password'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      } catch {
        res = await fetch('/api/backend/auth/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      }

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Failed to change password.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error changing password.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(getApiEndpoint('/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data));
      }
    } catch (e) {
      console.error('Error refreshing user profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        updateProfile,
        changePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
