'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import LoadingSpinner from '@/components/loading-spinner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    // This effect runs when `loading` or `user` state changes.
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);
  
  // While checking for user, show a loading screen.
  // Or if there's no user yet, also show loading to prevent flashing of content.
  if (loading || !user) {
    return <LoadingSpinner fullScreen />;
  }

  // If user is authenticated, render the app layout.
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
