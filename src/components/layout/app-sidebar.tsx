'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  PlusSquare,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/opportunities/create', icon: PlusSquare, label: 'New Opportunity' },
  { href: '/profile', icon: UserIcon, label: 'Profile' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          <span className="text-2xl font-bold">CrewUp</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 text-base h-12"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base h-12"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
