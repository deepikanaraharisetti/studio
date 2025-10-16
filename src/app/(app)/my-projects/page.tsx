
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion, writeBatch, getDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Opportunity, UserProfile } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JoinRequestWithUserProfile extends UserProfile {
    opportunityId: string;
    opportunityTitle: string;
}

export default function MyProjectsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const opportunitiesQuery = useMemoFirebase(() =>
    user && firestore
      ? query(collection(firestore, "opportunities"), where("ownerId", "==", user.uid))
      : null
  , [user, firestore]);

  const { data: opportunitiesList, isLoading: opportunitiesLoading, error: opportunitiesError } = useCollection<Opportunity>(opportunitiesQuery);
  const [joinRequests, setJoinRequests] = useState<JoinRequestWithUserProfile[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    const fetchJoinRequestProfiles = async () => {
        if (!opportunitiesList || !firestore) {
            setJoinRequests([]);
            setRequestsLoading(false);
            return;
        }
    
        setRequestsLoading(true);
        
        const allRequests: JoinRequestWithUserProfile[] = [];
        const allRequestUserIds = opportunitiesList.flatMap(opp => 
            (opp.joinRequests || []).map(userId => ({ userId, opp }))
        );

        if (allRequestUserIds.length === 0) {
            setJoinRequests([]);
            setRequestsLoading(false);
            return;
        }

        const uniqueUserIds = [...new Set(allRequestUserIds.map(req => req.userId))];
        const usersRef = collection(firestore, 'users');

        // Efficiently fetch all user profiles by their document ID (which is the UID)
        const userProfilePromises = uniqueUserIds.map(userId => getDoc(doc(usersRef, userId)));
        
        const userProfileSnapshots = await Promise.all(userProfilePromises);
        const profilesMap = new Map<string, UserProfile>();
        userProfileSnapshots.forEach(docSnap => {
            if (docSnap.exists()) {
                profilesMap.set(docSnap.id, docSnap.data() as UserProfile);
            }
        });

        for (const { userId, opp } of allRequestUserIds) {
            const profile = profilesMap.get(userId);
            if (profile) {
                allRequests.push({
                    ...profile,
                    opportunityId: opp.id,
                    opportunityTitle: opp.title,
                });
            }
        }

        setJoinRequests(allRequests);
        setRequestsLoading(false);
    }

    if (!opportunitiesLoading) {
        fetchJoinRequestProfiles();
    }
  }, [opportunitiesList, opportunitiesLoading, firestore]);
  
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const handleRequestAction = (request: JoinRequestWithUserProfile, action: 'accept' | 'decline') => {
    if (!user || !firestore) return;
    
    const opportunityRef = doc(firestore, 'opportunities', request.opportunityId);
    let updateData: any;

    if (action === 'accept') {
        const userProfileData = {
            uid: request.uid,
            displayName: request.displayName,
            email: request.email,
            photoURL: request.photoURL,
        };
        updateData = {
            teamMembers: arrayUnion(userProfileData),
            teamMemberIds: arrayUnion(request.uid),
            joinRequests: arrayRemove(request.uid)
        };
        updateDoc(opportunityRef, updateData)
            .then(() => {
                toast({ title: 'Member Added', description: `${request.displayName} is now on the team.` });
                setJoinRequests(prev => prev.filter(r => r.uid !== request.uid || r.opportunityId !== request.opportunityId));
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: opportunityRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                    cause: serverError
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    } else { // decline
        updateData = {
            joinRequests: arrayRemove(request.uid)
        };
        updateDoc(opportunityRef, updateData)
            .then(() => {
                toast({ title: 'Request Declined', description: `You have declined the request from ${request.displayName}.` });
                setJoinRequests(prev => prev.filter(r => r.uid !== request.uid || r.opportunityId !== request.opportunityId));
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: opportunityRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                    cause: serverError
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }
  }

  const loading = opportunitiesLoading || requestsLoading;
  const error = opportunitiesError;

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
                <div key={request.uid + request.opportunityId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                        <Link href={`/users/${request.uid}`}>
                            <Avatar>
                                <AvatarImage src={request.photoURL || ''} />
                                <AvatarFallback>{getInitials(request.displayName)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="text-sm">
                            <Link href={`/users/${request.uid}`} className="font-semibold hover:underline">{request.displayName}</Link>
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
