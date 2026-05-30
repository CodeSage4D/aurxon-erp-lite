'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParentDashboard from '@/12_ParentPortal/ParentDashboard';

export default function ParentPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const cached = localStorage.getItem('aurxon_user');
    if (!cached) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(cached);
    if (parsed.role !== 'PARENT') {
      router.push('/dashboard');
      return;
    }
    setUser(parsed);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aurxon_token');
    localStorage.removeItem('aurxon_user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground transition-colors duration-500">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 text-primary animate-spin border-4 border-solid border-current border-r-transparent rounded-full mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <ParentDashboard user={user} handleLogout={handleLogout} />;
}
