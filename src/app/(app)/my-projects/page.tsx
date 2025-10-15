
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Opportunity, JoinRequest } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function MyProjectsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const opportunitiesQuery = useMemoFirebase(() =>
    user && firestore
      ? query(collection(firestore, "opportunities"), where("ownerId", "==", user.uid))
      : null
  , [user, firestore]);

  const requestsQuery = useMemoFirebase(() =>
    user && firestore
      ? query(collection(firestore, "requests"), where("opportunityOwnerId", "==", user.uid), where("status", "==", "pending"))
      : null
  , [user, firestore]);

  const { data: opportunitiesList, isLoading: opportunitiesLoading, error: opportunitiesError } = useCollection<Opportunity>(opportunitiesQuery);
  const { data: joinRequests, isLoading: requestsLoading, error: requestsError } = useCollection<JoinRequest>(requestsQuery);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const handleRequestAction = async (request: JoinRequest, action: 'accept' | 'decline') => {
    if (!user || !firestore) return;
    
    const requestRef = doc(firestore, 'requests', request.id);

    try {
        if (action === 'accept') {
            const userProfileSnap = await getDoc(doc(firestore, 'users', request.userId));
            if (!userProfileSnap.exists()) throw new Error("Applicant profile not found");
            const applicantProfile = userProfileSnap.data();

            const opportunityRef = doc(firestore, 'opportunities', request.opportunityId);
            await updateDoc(opportunityRef, {
                teamMembers: arrayUnion(applicantProfile),
                teamMemberIds: arrayUnion(request.userId),
            });
            await updateDoc(requestRef, { status: 'accepted' });

            toast({ title: 'Member Added', description: `${request.userName} is now on the team.` });
        } else { // decline
            await updateDoc(requestRef, { status: 'declined' });
            toast({ title: 'Request Declined', description: `You have declined the request from ${request.userName}.` });
        }
    } catch (error) {
        console.error("Error handling request:", error)
        toast({ title: "Error", description: "Could not process the request. Please try again.", variant: "destructive" });
    }
  }

  const loading = opportunitiesLoading || requestsLoading;
  const error = opportunitiesError || requestsError;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">My Projects</CardTitle>
          <CardDescription>Manage your created opportunities and review join requests.</CardDescription>
        </CardHeader>
      </Card>
      
      {error && <p className='text-destructive'>Error: {error.message}</p>}

      {joinRequests && joinRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Join Requests ({joinRequests.length})</CardTitle>
            <CardDescription>Review users who want to join your projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {joinRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                        <Link href={`/users/${request.userId}`}>
                            <Avatar>
                                <AvatarImage src={request.userPhotoURL || ''} />
                                <AvatarFallback>{getInitials(request.userName)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="text-sm">
                            <Link href={`/users/${request.userId}`} className="font-semibold hover:underline">{request.userName}</Link>
                            <span> wants to join </span>
                            <Link href={`/opportunities/${request.opportunityId}`} className="font-semibold hover:underline">{request.opportunityTitle}</Link>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/50" onClick={() => handleRequestAction(request, 'accept')}><Check className="w-4 h-4"/></Button>
                        <Button size="icon" variant="outline" className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50" onClick={() => handleRequestAction(request, 'decline')}><X className="w-4 h-4"/></Button>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Created Projects</CardTitle>
        </CardHeader>
        <CardContent>
        {opportunitiesList && opportunitiesList.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {opportunitiesList.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
        ) : (
          <div className="text-center py-12">
              <h3 className="text-lg font-medium">You haven't created any projects yet.</h3>
              <p className="text-muted-foreground">Get started by creating a new opportunity!</p>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
