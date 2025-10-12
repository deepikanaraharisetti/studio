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
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [ownedOpportunities] = useCollection(
    userProfile
      ? query(collection(db, 'opportunities'), where('ownerId', '==', userProfile.uid))
      : null
  );

  const totalJoinRequests =
    ownedOpportunities?.docs.reduce((acc, doc) => {
      const opportunity = doc.data() as Opportunity;
      return acc + (opportunity.joinRequests?.length || 0);
    }, 0) || 0;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/my-projects', icon: FolderKanban, label: 'My Projects', badge: totalJoinRequests > 0 ? totalJoinRequests : undefined },
    { href: '/opportunities/create', icon: PlusSquare, label: 'New Opportunity' },
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
