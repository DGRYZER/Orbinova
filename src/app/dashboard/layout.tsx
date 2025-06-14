
"use client";

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/'); // Redirect to landing/login selection if not logged in
    }
  }, [currentUser, isLoading, router]);

  // Redirect to role-specific dashboard if on base /dashboard path
  // This hook must be called before any conditional returns.
  useEffect(() => {
    if (currentUser && router.pathname === '/dashboard') {
      if (currentUser.designation === 'HR') {
        router.replace('/dashboard/hr');
      } else {
        router.replace('/dashboard/employee');
      }
    }
  }, [currentUser, router, router.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium">Loading Orbinova...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This state should ideally be brief due to the useEffect redirect.
    // You could show a redirecting message or just null.
    return null;
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col bg-background">
=======
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
      <DashboardHeader />
      <main className="flex-1 container py-8 max-w-screen-2xl">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
<<<<<<< HEAD
        <p>Orbinova &copy; {new Date().getFullYear()}</p>
        <p>Created by Debajyoti</p>
=======
        Orbinova &copy; {new Date().getFullYear()}
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
      </footer>
    </div>
  );
}
