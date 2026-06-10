'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandBranding {
  primaryColor: string;
  logoUrl: string;
  orgName: string;
  favicon?: string;
}

interface BrandContextType {
  primaryColor: string;
  logoUrl: string;
  orgName: string;
  syncBranding: (brand: BrandBranding) => void;
  resetBranding: () => void;
}

const DEFAULT_BRANDING: BrandBranding = {
  primaryColor: '#2563EB', // Official brand primary
  logoUrl: '',
  orgName: 'AURXON ERP',
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBrandingState] = useState<BrandBranding>(DEFAULT_BRANDING);

  const applyBrandingStyles = (brand: BrandBranding) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const color = brand.primaryColor || '#2563EB';

    root.style.setProperty('--primary', color);
    
    // Calculate custom hover (slightly darker)
    const hoverColor = adjustColorBrightness(color, -15);
    root.style.setProperty('--hover', hoverColor);

    // Calculate shadow
    root.style.setProperty('--shadow', `${color}1a`); // 10% opacity primary shadow
    
    // Set custom text color for primary button background if contrast requires it
    const primaryText = getContrastColor(color);
    root.style.setProperty('--primary-text', primaryText);
  };

  useEffect(() => {
    // Resolve cached branding context
    const cachedContext = localStorage.getItem('aurxon_context');
    const cachedUser = localStorage.getItem('aurxon_user');
    
    let resolved: BrandBranding = DEFAULT_BRANDING;
    
    if (cachedContext) {
      try {
        const contextObj = JSON.parse(cachedContext);
        if (contextObj.branding) {
          resolved = {
            primaryColor: contextObj.branding.primaryColor || '#2563EB',
            logoUrl: contextObj.branding.logoUrl || '',
            orgName: contextObj.organizationName || 'AURXON ERP',
          };
        }
      } catch (e) {}
    } else if (cachedUser) {
      try {
        const userObj = JSON.parse(cachedUser);
        resolved = {
          primaryColor: userObj.primaryColor || '#2563EB',
          logoUrl: userObj.logoUrl || '',
          orgName: userObj.institutionName || 'AURXON ERP',
        };
      } catch (e) {}
    }

    setBrandingState(resolved);
    applyBrandingStyles(resolved);
  }, []);

  const syncBranding = (brand: BrandBranding) => {
    const updated = {
      primaryColor: brand.primaryColor || '#2563EB',
      logoUrl: brand.logoUrl || '',
      orgName: brand.orgName || 'AURXON ERP',
      favicon: brand.favicon,
    };
    setBrandingState(updated);
    applyBrandingStyles(updated);
  };

  const resetBranding = () => {
    setBrandingState(DEFAULT_BRANDING);
    applyBrandingStyles(DEFAULT_BRANDING);
  };

  return (
    <BrandContext.Provider
      value={{
        primaryColor: branding.primaryColor,
        logoUrl: branding.logoUrl,
        orgName: branding.orgName,
        syncBranding,
        resetBranding,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}

// Helper: Adjust hex color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + (R * percent) / 100));
  G = Math.max(0, Math.min(255, G + (G * percent) / 100));
  B = Math.max(0, Math.min(255, B + (B * percent) / 100));

  const rHex = Math.round(R).toString(16).padStart(2, '0');
  const gHex = Math.round(G).toString(16).padStart(2, '0');
  const bHex = Math.round(B).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Helper: Determine text color (white or black) based on color brightness contrast
function getContrastColor(hex: string): string {
  const R = parseInt(hex.substring(1, 3), 16);
  const G = parseInt(hex.substring(3, 5), 16);
  const B = parseInt(hex.substring(5, 7), 16);
  const brightness = (R * 299 + G * 587 + B * 114) / 1000;
  return brightness > 140 ? '#000000' : '#FFFFFF';
}
