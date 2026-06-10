'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TenantContextType {
  enabledModules: string[];
  enabledFeatures: string[];
  setupCompleted: boolean;
  industryPackCode: string | null;
  syncTenantContext: (context: any) => void;
  resetTenantContext: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [setupCompleted, setSetupCompleted] = useState<boolean>(true);
  const [industryPackCode, setIndustryPackCode] = useState<string | null>(null);

  useEffect(() => {
    const cachedContext = localStorage.getItem('aurxon_context');
    if (cachedContext) {
      try {
        const contextObj = JSON.parse(cachedContext);
        setEnabledModules(contextObj.enabledModules || []);
        setEnabledFeatures(contextObj.enabledFeatures || []);
        setSetupCompleted(contextObj.setupCompleted !== false);
        setIndustryPackCode(contextObj.branding?.industryPackCode || null);
      } catch (e) {}
    }
  }, []);

  const syncTenantContext = (contextObj: any) => {
    if (contextObj) {
      setEnabledModules(contextObj.enabledModules || []);
      setEnabledFeatures(contextObj.enabledFeatures || []);
      setSetupCompleted(contextObj.setupCompleted !== false);
      setIndustryPackCode(contextObj.branding?.industryPackCode || contextObj.industryPackCode || null);
    }
  };

  const resetTenantContext = () => {
    setEnabledModules([]);
    setEnabledFeatures([]);
    setSetupCompleted(true);
    setIndustryPackCode(null);
  };

  return (
    <TenantContext.Provider
      value={{
        enabledModules,
        enabledFeatures,
        setupCompleted,
        industryPackCode,
        syncTenantContext,
        resetTenantContext,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
