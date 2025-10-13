'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity, UserProfile } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

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

function OpportunityDetailsPageComponent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const docRef = doc(db, 'opportunities', id);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setOpportunity({ id: docSnap.id, ...docSnap.data() } as Opportunity);
        } else {
          // Handle not found
          setOpportunity(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleJoinRequest = async () => {
    if (!userProfile || !opportunity) return;
    setIsSubmitting(true);

    try {
      const opportunityRef = doc(db, 'opportunities', id);
      await updateDoc(opportunityRef, {
        joinRequests: arrayUnion(userProfile),
      });
      toast({ title: "Request Sent!", description: "The project owner has been notified of your interest." });
    } catch (error) {
      toast({ title: "Error", description: "Could not send join request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestAction = async (applicant: UserProfile, action: 'accept' | 'decline') => {
    if (!userProfile || !opportunity || userProfile.uid !== opportunity.ownerId) return;

    const opportunityRef = doc(db, 'opportunities', id);

    try {
        if (action === 'accept') {
            await updateDoc(opportunityRef, {
                teamMembers: arrayUnion(applicant),
                joinRequests: arrayRemove(applicant),
            });
            toast({ title: 'Member Added', description: `${applicant.displayName} is now on the team.` });
        } else { // decline
            await updateDoc(opportunityRef, {
                joinRequests: arrayRemove(applicant),
            });
            toast({ title: 'Request Declined', description: `You have declined the request from ${applicant.displayName}.` });
        }
    } catch (error) {
        toast({ title: "Error", description: "Could not process the request. Please try again.", variant: "destructive" });
    }
  }

  const isOwner = opportunity?.ownerId === userProfile?.uid;
  const isMember = opportunity?.teamMembers.some(member => member.uid === userProfile?.uid);
  const hasRequested = opportunity?.joinRequests?.some(req => req.uid === userProfile?.uid);
  
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getJoinButton = () => {
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

        {isOwner && (opportunity.joinRequests?.length ?? 0) > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>Review users who want to join your team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {opportunity.joinRequests.map(applicant => (
                        <div key={applicant.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <Link href={`/users/${applicant.uid}`}>
                                    <Avatar>
                                        <AvatarImage src={applicant.photoURL || ''} />
                                        <AvatarFallback>{getInitials(applicant.displayName)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <Link href={`/users/${applicant.uid}`} className="font-semibold hover:underline">{applicant.displayName}</Link>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(applicant.skills || []).slice(0,3).map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                        {(applicant.skills?.length || 0) > 3 && <Badge variant="outline">+{(applicant.skills?.length || 0) - 3}</Badge>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" className="text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/50" onClick={() => handleRequestAction(applicant, 'accept')}><Check className="w-4 h-4"/></Button>
                                <Button size="icon" variant="outline" className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50" onClick={() => handleRequestAction(applicant, 'decline')}><X className="w-4 h-4"/></Button>
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
                <p className="text-sm text-muted-foreground">Project Owner</p>
              </div>
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

export default function OpportunityDetailsPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
            <OpportunityDetailsPageComponent paramsPromise={Promise.resolve(params)} />
        </Suspense>
    );
}
