'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { switchContextApi } from '@/lib/api';
import { Shield, Sparkles, Building, ArrowRight, LogOut, CheckCircle } from 'lucide-react';

interface Membership {
  id: string;
  organizationId: string;
  organizationName: string;
  logoUrl: string;
  primaryColor: string;
  role: string;
  roleName: string;
  schoolId: string | null;
  campusId: string | null;
  isPrimary: boolean;
}

export default function OrganizationSelectPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Enable dark mode for this selection screen
    document.documentElement.classList.add('dark');

    const cachedMemberships = localStorage.getItem('aurxon_memberships');
    const cachedUser = localStorage.getItem('aurxon_user');

    if (!cachedUser) {
      router.push('/login');
      return;
    }

    setUserProfile(JSON.parse(cachedUser));

    if (cachedMemberships) {
      try {
        const parsed = JSON.parse(cachedMemberships);
        setMemberships(parsed);
      } catch (e) {
        setError('Failed to load memberships.');
      }
    } else {
      setError('No organization memberships found.');
    }
  }, [router]);

  const handleSelect = async (membership: Membership) => {
    setLoading(true);
    setError('');
    setSelectedId(membership.id);

    try {
      await switchContextApi(membership.organizationId, membership.schoolId, membership.campusId);
      
      // Briefly show success before routing
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve organization context. Please try again.');
      setLoading(false);
      setSelectedId(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    localStorage.removeItem('aurxon_memberships');
    localStorage.removeItem('aurxon_context');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-500 sm:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[45%] w-[45%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 z-10 relative">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover-lift">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Switch Organization Context
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Welcome back, <span className="text-foreground font-bold">{userProfile?.profileName || userProfile?.email}</span>. Please choose an organization to enter.
          </p>
        </div>

        {/* Memberships Selection Container */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-border">
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {memberships.map((membership) => {
              const isSelected = selectedId === membership.id;
              
              return (
                <button
                  key={membership.id}
                  onClick={() => !loading && handleSelect(membership)}
                  disabled={loading}
                  style={{
                    borderLeft: `5px solid ${membership.primaryColor || '#0284c7'}`
                  }}
                  className={`w-full text-left p-5 rounded-2xl border border-border/60 bg-card/20 hover:bg-card/70 hover:border-primary/50 transition-all duration-300 hover-lift flex items-center justify-between group relative overflow-hidden ${
                    isSelected ? 'ring-2 ring-primary/60 bg-card/90' : ''
                  } ${loading && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Organization Logo */}
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                      {membership.logoUrl ? (
                        <img
                          src={membership.logoUrl}
                          alt={membership.organizationName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                        {membership.organizationName}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{
                            backgroundColor: `${membership.primaryColor}15`,
                            color: membership.primaryColor
                          }}
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide border border-border/20 uppercase"
                        >
                          {membership.roleName}
                        </span>
                        
                        {(membership.schoolId || membership.campusId) && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {[membership.schoolId, membership.campusId].filter(Boolean).join(' • ')}
                          </span>
                        )}

                        {membership.isPrimary && (
                          <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isSelected ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 animate-pulse shrink-0" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}

            {memberships.length === 0 && !error && (
              <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                No active memberships found for this account.
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground hover-lift transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out & Try Another Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
