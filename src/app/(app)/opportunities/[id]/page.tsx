'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

import LoadingSpinner from '@/components/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, FileText, MessageSquare, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OpportunityChat from '@/components/opportunity-chat';
import OpportunityFiles from '@/components/opportunity-files';
import { mockOpportunities } from '@/lib/mock-data';

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';


export default function OpportunityDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchOpportunity = async () => {
        setLoading(true);
        if (MOCK_AUTH) {
            const opp = mockOpportunities.find(o => o.id === id);
            setOpportunity(opp || null);
        } else {
            const docRef = doc(db, 'opportunities', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setOpportunity({ id: docSnap.id, ...docSnap.data() } as Opportunity);
            } else {
              // Handle not found
            }
        }
        setLoading(false);
      };
      fetchOpportunity();
    }
  }, [id]);

  const handleJoinTeam = async () => {
    if (!userProfile || !opportunity) return;
    setIsJoining(true);

    if (MOCK_AUTH) {
        // In mock mode, just update the state
        setOpportunity(prev => prev ? { ...prev, teamMembers: [...prev.teamMembers, userProfile] } : null);
        toast({ title: "Welcome to the team!", description: "You can now collaborate on this opportunity." });
        setIsJoining(false);
        return;
    }

    try {
      const opportunityRef = doc(db, 'opportunities', id);
      await updateDoc(opportunityRef, {
        teamMembers: arrayUnion({
          uid: userProfile.uid,
          displayName: userProfile.displayName,
          photoURL: userProfile.photoURL,
        }),
      });
      setOpportunity(prev => prev ? { ...prev, teamMembers: [...prev.teamMembers, userProfile] } : null);
      toast({ title: "Welcome to the team!", description: "You can now collaborate on this opportunity." });
    } catch (error) {
      toast({ title: "Error", description: "Could not join the team. Please try again.", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const isMember = opportunity?.teamMembers.some(member => member.uid === userProfile?.uid) || opportunity?.ownerId === userProfile?.uid;
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };


  if (loading) return <LoadingSpinner fullScreen />;
  if (!opportunity) return <div className="text-center py-12">Opportunity not found.</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
             <h1 className="text-3xl font-bold">{opportunity.title}</h1>
             <p className="text-muted-foreground">Project posted by {opportunity.ownerName}</p>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{opportunity.description}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2"/>Chat</TabsTrigger>
                <TabsTrigger value="files"><FileText className="w-4 h-4 mr-2"/>Files</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
                <OpportunityChat opportunityId={id} isMember={isMember} />
            </TabsContent>
            <TabsContent value="files">
                <OpportunityFiles opportunityId={id} isMember={isMember} />
            </TabsContent>
        </Tabs>

      </div>
      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardContent className="p-6">
            <Button
              className="w-full"
              size="lg"
              onClick={handleJoinTeam}
              disabled={isMember || isJoining}
            >
              {isJoining ? <LoadingSpinner /> : (isMember ? "You're on the team" : <> <PlusCircle className="mr-2"/> Join Team </>)}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/>Needed Skills & Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Roles</h4>
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
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={opportunity.ownerPhotoURL} />
                <AvatarFallback>{getInitials(opportunity.ownerName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{opportunity.ownerName}</p>
                <p className="text-sm text-muted-foreground">Project Owner</p>
              </div>
            </div>
            {opportunity.teamMembers.map(member => (
              <div key={member.uid} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.photoURL || ''} />
                  <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{member.displayName}</p>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
