'use client';

import Link from 'next/link';
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusSquare,
  User as UserIcon,
  FolderKanban,
  LineChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserNav from './user-nav';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import { Badge } from '../ui/badge';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();
  
  const [ownedOpportunities] = useCollection(
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
    { href: '/analytics', icon: LineChart, label: 'Analytics' },
    { href: '/my-projects', icon: FolderKanban, label: 'My Projects', badge: totalJoinRequests > 0 ? totalJoinRequests : undefined },
    { href: '/opportunities/create', icon: PlusSquare, label: 'New Opportunity' },
    { href: '/profile', icon: UserIcon, label: 'Profile' },
  ];


  return (
    <header className="flex h-20 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0 w-72">
          <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold tracking-tighter">CrewUp</span>
            </Link>
          </div>
          <nav className="flex-1 grid gap-2 p-4">
            {navItems.map((item) => (
                <Button
                    key={item.href}
                    variant={pathname.startsWith(item.href) ? 'sidebar-secondary' as any : 'ghost'}
                    className="w-full justify-start gap-3 text-base h-12 rounded-lg"
                    asChild
                >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      {item.badge && <Badge className="ml-auto">{item.badge}</Badge>}
                    </Link>
                </Button>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base h-12 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 md:hidden">
         <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="w-6 h-6 text-primary" />
          <span className="sr-only">CrewUp</span>
        </Link>
      </div>

      <div className='flex-1' />

      <UserNav />
    </header>
  );
}
