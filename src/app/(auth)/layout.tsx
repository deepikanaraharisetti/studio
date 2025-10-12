import React from 'react';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Briefcase className="w-6 h-6" />
          <span className="text-xl font-bold">CrewUp</span>
        </Link>
      </div>
      <ClientOnly>
        {children}
      </ClientOnly>
    </main>
  );
}
