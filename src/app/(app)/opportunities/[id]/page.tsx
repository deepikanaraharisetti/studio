
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { doc, updateDoc, arrayUnion, onSnapshot, getDoc, collection, query, where, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { Opportunity, UserProfile, JoinRequest } from '@/lib/types';

import LoadingSpinner from '@/components/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, FileText, MessageSquare, PlusCircle, Check, X, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OpportunityChat from '@/components/opportunity-chat';
import OpportunityFiles from '@/components/opportunity-files';

export default function OpportunityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch join requests for this opportunity
  const requestsQuery = useMemoFirebase(() => 
    firestore && id 
      ? query(collection(firestore, 'requests'), where('opportunityId', '==', id), where('status', '==', 'pending'))
      : null
  , [firestore, id]);
  const { data: joinRequests } = useCollection<JoinRequest>(requestsQuery);

  // Check if the current user has already requested to join
  const userRequestQuery = useMemoFirebase(() =>
    firestore && id && user
        ? query(collection(firestore, 'requests'), where('opportunityId', '==', id), where('userId', '==', user.uid))
        : null
  , [firestore, id, user]);
  const { data: userRequest, isLoading: isUserRequestLoading } = useCollection<JoinRequest>(userRequestQuery);


  useEffect(() => {
    if (id && firestore) {
      const docRef = doc(firestore, 'opportunities', id);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setOpportunity({ id: docSnap.id, ...docSnap.data() } as Opportunity);
        } else {
          setOpportunity(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching opportunity:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id, firestore]);

  const handleJoinRequest = async () => {
    if (!user || !opportunity || !firestore) return;
    setIsSubmitting(true);
  
    try {
      const userProfileSnap = await getDoc(doc(firestore, 'users', user.uid));
      if (!userProfileSnap.exists()) {
        throw new Error("Could not find your user profile.");
      }
      const applicantProfile = userProfileSnap.data() as UserProfile;

      const requestData = {
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        opportunityOwnerId: opportunity.ownerId,
        userId: user.uid,
        userName: applicantProfile.displayName || 'Anonymous',
        userPhotoURL: applicantProfile.photoURL || null,
        userSkills: applicantProfile.skills || [],
        status: 'pending' as const,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'requests'), requestData);
  
      toast({ title: "Request Sent!", description: "The project owner has been notified of your interest." });
    
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: 'requests',
            operation: 'create',
            requestResourceData: { opportunityId: opportunity.id },
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRequestAction = async (request: JoinRequest, action: 'accept' | 'decline') => {
    if (!user || !opportunity || user.uid !== opportunity.ownerId || !firestore) return;
    
    const requestRef = doc(firestore, 'requests', request.id);

    try {
        if (action === 'accept') {
            const userProfileSnap = await getDoc(doc(firestore, 'users', request.userId));
            if (!userProfileSnap.exists()) throw new Error("Applicant profile not found");
            const applicantProfile = userProfileSnap.data() as UserProfile;

            const opportunityRef = doc(firestore, 'opportunities', id);
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

  const isOwner = opportunity?.ownerId === user?.uid;
  const isMember = opportunity?.teamMemberIds?.includes(user?.uid || '');
  const hasRequested = userRequest && userRequest.length > 0 && userRequest[0].status === 'pending';
  
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getJoinButton = () => {
    if (isUserRequestLoading) return <Button className="w-full" size="lg" disabled><LoadingSpinner /></Button>;
    if (isMember) return <Button className="w-full" size="lg" disabled><UserCheck className="mr-2"/>You're on the team</Button>;
    if (hasRequested) return <Button className="w-full" size="lg" disabled variant="outline">Request Sent</Button>;
    if (isOwner) return <Button className="w-full" size="lg" disabled variant="outline">You are the owner</Button>;
    return (
        <Button className="w-full" size="lg" onClick={handleJoinRequest} disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner /> : <> <PlusCircle className="mr-2"/> Request to Join </>}
        </Button>
    )
  }

  if (loading) return <LoadingSpinner fullScreen />;
  if (!opportunity) return <div className="text-center py-12">Opportunity not found.</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
             <h1 className="text-3xl font-bold tracking-tight">{opportunity.title}</h1>
             <p className="text-muted-foreground">
                Project posted by <Link href={`/users/${opportunity.ownerId}`} className="font-medium text-card-foreground hover:underline">{opportunity.ownerName}</Link>
             </p>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{opportunity.description}</p>
          </CardContent>
        </Card>

        {isOwner && (joinRequests?.length ?? 0) > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>Review users who want to join your team.</CardDescription>
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
                                <div>
                                    <Link href={`/users/${request.userId}`} className="font-semibold hover:underline">{request.userName}</Link>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(request.userSkills || []).slice(0,3).map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                        {(request.userSkills?.length || 0) > 3 && <Badge variant="outline">+{(request.userSkills?.length || 0) - 3}</Badge>}
                                    </div>
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

        {(isMember || isOwner) && (
          <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2"/>Chat</TabsTrigger>
                  <TabsTrigger value="files"><FileText className="w-4 h-4 mr-2"/>Files</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                  <OpportunityChat opportunityId={id} isMember={isMember || isOwner} />
              </TabsContent>
              <TabsContent value="files">
                  <OpportunityFiles opportunityId={id} isMember={isMember || isOwner} />
              </TabsContent>
          </Tabs>
        )}

      </div>
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="p-6">
            {getJoinButton()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/>Needed Skills & Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm tracking-tight">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm tracking-tight">Roles</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.roles.map(role => (
                  <Badge key={role}>{role}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/>Team Members ({opportunity.teamMembers.length + 1})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/users/${opportunity.ownerId}`} className="flex items-center gap-3 hover:bg-accent p-2 rounded-md">
              <Avatar>
                <AvatarImage src={opportunity.ownerPhotoURL} />
                <AvatarFallback>{getInitials(opportunity.ownerName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{opportunity.ownerName}</p>
                <p className="text-sm text-muted-foreground">Project Owner</p>              </div>
            </Link>
            {opportunity.teamMembers.map(member => (
              <Link href={`/users/${member.uid}`} key={member.uid} className="flex items-center gap-3 hover:bg-accent p-2 rounded-md">
                <Avatar>
                  <AvatarImage src={member.photoURL || ''} />
                  <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{member.displayName}</p>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
