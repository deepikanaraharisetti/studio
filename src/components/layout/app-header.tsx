'use client';

import Link from 'next/link';
import {
  Briefcase,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNav from './user-nav';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { Opportunity } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { db } from '@/lib/firebase';

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
