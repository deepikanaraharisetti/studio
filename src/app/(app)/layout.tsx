
'use client';

import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/app-header';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  Briefcase,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PlusSquare,
  Search,
  User,
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase } from '@/firebase';
import { usePathname } from 'next/navigation';
import { collection, query, where } from 'firebase/firestore';
import { Opportunity } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'firebase/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const opportunitiesQuery = useMemoFirebase(() => 
    user && firestore
      ? query(collection(firestore, 'opportunities'), where('ownerId', '==', user.uid))
      : null
  , [user, firestore]);

  const { data: ownedOpportunities } = useCollection(opportunitiesQuery);

  const totalJoinRequests =
    ownedOpportunities?.reduce((acc, doc) => {
      const opportunity = doc as Opportunity;
      return acc + (opportunity.joinRequests?.length || 0);
    }, 0) || 0;

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/my-projects', icon: FolderKanban, label: 'My Projects', badge: totalJoinRequests > 0 ? totalJoinRequests : undefined },
    { href: '/opportunities/create', icon: PlusSquare, label: 'New Opportunity' },
    { href: user ? `/users/${user.uid}` : '/profile', icon: User, label: 'My Profile' },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href + item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && <Badge variant="destructive" className="ml-auto group-data-[collapsible=icon]:hidden">{item.badge}</Badge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
