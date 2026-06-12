'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, ToggleLeft, ToggleRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import {
  getModulesApi,
  getOrgModulesApi,
  toggleModuleApi,
  getFeaturesApi,
  getOrgFeaturesApi,
  toggleFeatureApi,
  refreshContextApi
} from '@/services/api';

interface Module {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface Feature {
  id: string;
  name: string;
  code: string;
  moduleId: string;
  description: string;
}

interface OrgModule {
  moduleCode: string;
  isEnabled: boolean;
}

interface OrgFeature {
  featureCode: string;
  isEnabled: boolean;
}

interface MarketplaceTabProps {
  triggerToast: (msg: string) => void;
}

export default function MarketplaceTab({ triggerToast }: MarketplaceTabProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [orgModules, setOrgModules] = useState<string[]>([]);
  const [orgFeatures, setOrgFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const allMods = await getModulesApi();
      const allFeats = await getFeaturesApi();
      const activeMods = await getOrgModulesApi();
      const activeFeats = await getOrgFeaturesApi();

      setModules(allMods);
      setFeatures(allFeats);
      setOrgModules(activeMods.filter((m: OrgModule) => m.isEnabled).map((m: OrgModule) => m.moduleCode));
      setOrgFeatures(activeFeats.filter((f: OrgFeature) => f.isEnabled).map((f: OrgFeature) => f.featureCode));
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load Marketplace telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (code: string, active: boolean) => {
    try {
      await toggleModuleApi(code, !active);
      setOrgModules(prev => {
        if (active) {
          return prev.filter(c => c !== code);
        } else {
          return [...prev, code];
        }
      });
      setNeedsRefresh(true);
      triggerToast(`Module ${code} activation changed.`);
    } catch (err) {
      alert('Failed to toggle module');
    }
  };

  const handleToggleFeature = async (code: string, active: boolean) => {
    try {
      await toggleFeatureApi(code, !active);
      setOrgFeatures(prev => {
        if (active) {
          return prev.filter(c => c !== code);
        } else {
          return [...prev, code];
        }
      });
      setNeedsRefresh(true);
      triggerToast(`Feature flag ${code} activation changed.`);
    } catch (err) {
      alert('Failed to toggle feature flag');
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshContextApi();
      setNeedsRefresh(false);
      triggerToast('Session successfully synced! Active modules/features updated.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert('Failed to refresh session context');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-4">Syncing Marketplace registries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {needsRefresh && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-semibold">
              <span className="font-black">Module/Feature Changes Detected:</span> Click refresh to rebuild your active workspace navigation menu without signing out.
            </div>
          </div>
          <button
            onClick={handleRefreshSession}
            className="flex items-center gap-2 rounded-xl bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-black shadow-md hover:bg-amber-400 transition"
          >
            <RefreshCw className="h-4 w-4 animate-spin-reverse" />
            <span>Sync Workspace</span>
          </button>
        </div>
      )}

      {/* Modules Marketplace Title */}
      <div>
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Aurxon Marketplace</h4>
        <p className="text-[10px] text-zinc-400 font-medium">Activate core ERP modules and feature toggles for your organization.</p>
      </div>

      {/* Modules Registry grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => {
          const isActivated = orgModules.includes(m.code);
          return (
            <div key={m.id} className="glass rounded-3xl p-6 border border-border shadow-lg space-y-4 hover:shadow-xl transition relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-primary/5 to-accent/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{m.name}</h3>
                      <span className="text-[8px] font-mono tracking-wide text-zinc-400 dark:text-zinc-500 uppercase">{m.code}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleModule(m.code, isActivated)}
                    className={`h-6 w-11 rounded-full relative flex items-center transition-colors ${
                      isActivated ? 'bg-emerald-500 justify-end' : 'bg-zinc-250 dark:bg-zinc-800 justify-start'
                    }`}
                  >
                    <span className="h-5 w-5 bg-white rounded-full shadow-sm mx-0.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-semibold mt-4 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide">
                <span className="text-zinc-400">License Verification</span>
                {isActivated ? (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Active Scope
                  </span>
                ) : (
                  <span className="text-zinc-400">Restricted</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Flags System Title */}
      <div className="pt-6 border-t border-border/40">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          <span>Feature Gating System</span>
        </h4>
        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Toggle optional integrations and high-performance extensions.</p>
      </div>

      {/* Feature Flags Registry List */}
      <div className="space-y-4">
        {features.map((f) => {
          const isFeatureActive = orgFeatures.includes(f.code);
          return (
            <div key={f.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/25 hover:bg-card/60 transition-all">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-xs font-black text-foreground">{f.name}</h5>
                  <span className="text-[8px] font-mono tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                    {f.code}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  {f.description}
                </p>
              </div>

              <button
                onClick={() => handleToggleFeature(f.code, isFeatureActive)}
                className={`h-5 w-10 rounded-full relative flex items-center transition-colors shrink-0 ${
                  isFeatureActive ? 'bg-sky-600 justify-end' : 'bg-zinc-250 dark:bg-zinc-800 justify-start'
                }`}
              >
                <span className="h-4 w-4 bg-white rounded-full shadow-sm mx-0.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
