
'use client';

import Link from 'next/link';
import {
  Briefcase,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNav from './user-nav';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Opportunity } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMemoFirebase } from '@/firebase/provider';

function getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}


function Notifications() {
    const { user } = useUser();
    const firestore = useFirestore();
    
    const opportunitiesQuery = useMemoFirebase(() =>
        user && firestore
            ? query(collection(firestore, "opportunities"), where("ownerId", "==", user.uid))
            : null
    , [user, firestore]);

    const { data: ownedOpportunities } = useCollection<Opportunity>(opportunitiesQuery);

    const router = useRouter();

    const handleNotificationClick = (opportunityId: string) => {
        router.push(`/opportunities/${opportunityId}`);
    };

    const requests = ownedOpportunities?.filter(opp => opp.joinRequests && opp.joinRequests.length > 0);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {requests && requests.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{requests.reduce((acc, opp) => acc + (opp.joinRequests?.length || 0), 0)}</Badge>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="end">
                <div className="font-semibold p-2">Notifications</div>
                <div className="border-t border-muted -mx-2 my-1" />
                {requests && requests.length > 0 ? (
                    <div className="space-y-1">
                        {requests.map((opp) => (
                            <div key={opp.id} 
                                 className="p-2 hover:bg-accent rounded-md cursor-pointer"
                                 onClick={() => handleNotificationClick(opp.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-sm">
                                        You have {opp.joinRequests.length} new request{opp.joinRequests.length > 1 ? 's' : ''} to join <span className="font-semibold">{opp.title}</span>.
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
  return (
    <header className="flex h-20 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <SidebarTrigger />
       <div className="flex-1">
         <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="w-6 h-6 text-primary" />
          <span className="hidden sm:inline-block">CrewUp</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Notifications />
        <UserNav />
      </div>
    </header>
  );
}
