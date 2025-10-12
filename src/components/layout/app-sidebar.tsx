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
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Badge } from '../ui/badge';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';


export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  const [ownedOpportunities, loading, error] = useCollection(
    userProfile ? query(collection(db, "opportunities"), where("ownerId", "==", userProfile.uid)) : null
  );

  const totalJoinRequests = ownedOpportunities?.docs.reduce((acc, doc) => {
    const opportunity = doc.data() as Opportunity;
    return acc + (opportunity.joinRequests?.length || 0);
  }, 0) || 0;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/my-projects', icon: FolderKanban, label: 'My Projects', badge: totalJoinRequests > 0 ? totalJoinRequests : undefined },
    { href: '/opportunities/create', icon: PlusSquare, label: 'New Opportunity' },
    { href: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          <span className="text-2xl font-bold">CrewUp</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname.startsWith(item.href) ? 'sidebar-secondary' as any : 'ghost'}
            className="w-full justify-start gap-3 text-base h-12 relative"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge && <Badge className="absolute right-4">{item.badge}</Badge>}
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
