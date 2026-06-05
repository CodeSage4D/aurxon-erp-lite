'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('aurxon_token');
    const context = localStorage.getItem('aurxon_context');
    const user = localStorage.getItem('aurxon_user');

    if (!token || !user) {
      router.replace('/login');
    } else if (!context) {
      router.replace('/organization-select');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Sleek Minimal Loading Indicator */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
          Resolving Aurxon Session...
        </p>
      </div>
    </div>
  );
}
