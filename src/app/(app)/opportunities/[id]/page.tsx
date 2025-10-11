'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import Image from 'next/image';

import LoadingSpinner from '@/components/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OpportunityChat from '@/components/opportunity-chat';
import OpportunityFiles from '@/components/opportunity-files';


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
        const docRef = doc(db, 'opportunities', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOpportunity({ id: docSnap.id, ...docSnap.data() } as Opportunity);
        } else {
          // Handle not found
        }
        setLoading(false);
      };
      fetchOpportunity();
    }
  }, [id]);

  const handleJoinTeam = async () => {
    if (!userProfile || !opportunity) return;
    setIsJoining(true);
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
      toast({ title: "Welcome!", description: "You've successfully joined the team." });
    } catch (error) {
      toast({ title: "Error", description: "Could not join the team. Please try again.", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const isMember = opportunity?.teamMembers.some(member => member.uid === userProfile?.uid);
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };


  if (loading) return <LoadingSpinner fullScreen />;
  if (!opportunity) return <div>Opportunity not found.</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader className="p-0">
            <div className="aspect-video relative bg-muted rounded-t-lg">
              {/* Image placeholder */}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
              <p>by {opportunity.ownerName}</p>
            </div>
            <p className="text-base whitespace-pre-wrap">{opportunity.description}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="chat" className="w-full">
            <TabsList>
                <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2"/>Chat</TabsTrigger>
                <TabsTrigger value="files"><FileText className="w-4 h-4 mr-2"/>Files</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
                <OpportunityChat opportunityId={id} isMember={isMember || opportunity.ownerId === userProfile?.uid} />
            </TabsContent>
            <TabsContent value="files">
                <OpportunityFiles opportunityId={id} isMember={isMember || opportunity.ownerId === userProfile?.uid} />
            </TabsContent>
        </Tabs>

      </div>
      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <Button
              className="w-full"
              onClick={handleJoinTeam}
              disabled={isMember || isJoining || opportunity.ownerId === userProfile?.uid}
            >
              {isJoining ? <LoadingSpinner className="h-4 w-4"/> : (isMember ? "You're on the team" : "Join Team")}
            </Button>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/>Needed Skills & Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Roles</h4>
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
