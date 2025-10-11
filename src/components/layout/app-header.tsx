'use client';

import Link from 'next/link';
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusSquare,
  User as UserIcon,
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

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/opportunities/create', icon: PlusSquare, label: 'New Opportunity' },
  { href: '/profile', icon: UserIcon, label: 'Profile' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/opportunities/create')) return 'Create Opportunity';
    if (pathname.startsWith('/opportunities/')) return 'Opportunity Details';
    if (pathname.startsWith('/profile')) return 'My Profile';
    return 'CrewUp';
  };

  return (
    <header className="flex h-20 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0">
          <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2">
                <Briefcase className="w-8 h-8" />
                <span className="text-2xl font-bold">CrewUp</span>
            </Link>
          </div>
          <nav className="flex-1 grid gap-2 p-4">
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
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base h-12"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="font-semibold text-xl">{getPageTitle()}</h1>
      </div>

      <UserNav />
    </header>
  );
}
