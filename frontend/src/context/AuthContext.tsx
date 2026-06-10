'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, switchContextApi } from '@/lib/api';

interface AuthContextType {
  user: any;
  token: string | null;
  context: any;
  memberships: any[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => void;
  switchContext: (organizationId: string, schoolId?: string | null, campusId?: string | null) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedToken = localStorage.getItem('aurxon_token');
    const cachedUser = localStorage.getItem('aurxon_user');
    const cachedContext = localStorage.getItem('aurxon_context');
    const cachedMemberships = localStorage.getItem('aurxon_memberships');

    if (cachedToken) setToken(cachedToken);
    if (cachedUser) setUser(JSON.parse(cachedUser));
    if (cachedContext) setContext(JSON.parse(cachedContext));
    if (cachedMemberships) setMemberships(JSON.parse(cachedMemberships));
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await loginApi(email, pass);
      setToken(data.token);
      setUser(data.user);
      setMemberships(data.memberships || []);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    localStorage.removeItem('aurxon_context');
    localStorage.removeItem('aurxon_memberships');
    localStorage.removeItem('aurxon_founder_token');
    localStorage.removeItem('aurxon_impersonating');
    setToken(null);
    setUser(null);
    setContext(null);
    setMemberships([]);
    router.push('/');
  };

  const switchContext = async (organizationId: string, schoolId?: string | null, campusId?: string | null) => {
    setLoading(true);
    try {
      const data = await switchContextApi(organizationId, schoolId, campusId);
      setToken(data.token);
      setContext(data.context);
      
      const cachedUser = localStorage.getItem('aurxon_user');
      if (cachedUser) {
        const userObj = JSON.parse(cachedUser);
        userObj.role = data.context.role;
        userObj.institutionId = data.context.organizationId;
        userObj.institutionName = data.context.organizationName;
        userObj.logoUrl = data.context.branding?.logoUrl || '';
        userObj.primaryColor = data.context.branding?.primaryColor || '#0284c7';
        userObj.themePreference = data.context.themePreference || 'system';
        setUser(userObj);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        context,
        memberships,
        loading,
        login,
        logout,
        switchContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contextValue = useContext(AuthContext);
  if (!contextValue) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return contextValue;
}
