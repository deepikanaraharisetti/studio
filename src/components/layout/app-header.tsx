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
  Bell,
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
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { Opportunity } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

function getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}


function Notifications() {
    const { userProfile } = useAuth();
    const [ownedOpportunities] = useCollection(
        userProfile ? query(collection(db, "opportunities"), where("ownerId", "==", userProfile.uid)) : null
    );

    const router = useRouter();

    const allJoinRequests = ownedOpportunities?.docs.flatMap(doc => {
        const opportunity = { id: doc.id, ...doc.data() } as Opportunity;
        return (opportunity.joinRequests || []).map(request => ({
            ...request,
            opportunityTitle: opportunity.title,
            opportunityId: opportunity.id
        }));
    }) || [];

    const handleNotificationClick = (opportunityId: string) => {
        router.push(`/opportunities/${opportunityId}`);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {allJoinRequests.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{allJoinRequests.length}</Badge>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="end">
                <div className="font-semibold p-2">Notifications</div>
                <div className="border-t border-muted -mx-2 my-1" />
                {allJoinRequests.length > 0 ? (
                    <div className="space-y-1">
                        {allJoinRequests.map((request, index) => (
                            <div key={`${request.uid}-${index}`} 
                                 className="p-2 hover:bg-accent rounded-md cursor-pointer"
                                 onClick={() => handleNotificationClick(request.opportunityId)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={request.photoURL || ''} />
                                        <AvatarFallback>{getInitials(request.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <span className="font-semibold">{request.displayName}</span> requested to join <span className="font-semibold">{request.opportunityTitle}</span>.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-sm text-muted-foreground p-4">
                        No new notifications.
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

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

      <div className="flex items-center gap-2">
        <Notifications />
        <UserNav />
      </div>
    </header>
  );
}
