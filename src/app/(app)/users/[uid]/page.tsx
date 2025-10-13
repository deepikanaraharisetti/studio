'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Opportunity } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import LoadingSpinner from '@/components/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProfileForm from '@/components/profile-form';
import OpportunityCard from '@/components/opportunity-card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

function ProfilePageComponent({ paramsPromise }: { paramsPromise: Promise<{ uid: string }> }) {
  const { uid } = use(paramsPromise);
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const { userProfile: authUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const user = docSnap.data() as UserProfile;
        setProfile(user);

        const ownedQuery = query(collection(db, "opportunities"), where("ownerId", "==", uid));
        const memberQuery = query(collection(db, "opportunities"), where("teamMembers", "array-contains", {uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, email: user.email}));
        
        const [ownedSnapshot, memberSnapshot] = await Promise.all([getDocs(ownedQuery), getDocs(memberQuery)]);

        const userProjects = ownedSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Opportunity));
        memberSnapshot.docs.forEach(d => {
            if(!userProjects.some(p => p.id === d.id)) {
                userProjects.push({id: d.id, ...d.data()} as Opportunity);
            }
        });
        setProjects(userProjects);

      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    if (uid) {
      fetchProfile();
    }
  }, [uid]);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isOwner = authUserProfile?.uid === uid;

  if (loading) return <LoadingSpinner fullScreen />;
  if (!profile) return <div className="text-center py-12">User not found.</div>;
  
  if (isEditMode && isOwner) {
    return (
       <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Your Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and preferences.</p>
            </div>
            <ProfileForm userProfile={profile} />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="bg-muted h-32" />
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 px-6">
            <Avatar className="h-32 w-32 border-4 border-card">
              <AvatarImage src={profile.photoURL || ''} />
              <AvatarFallback className="text-4xl">{getInitials(profile.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">{profile.displayName}</h1>
                    {isOwner && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/users/${uid}?edit=true`}>
                                <Pencil className="mr-2 h-3 w-3"/> Edit Profile
                            </Link>
                        </Button>
                    )}
                </div>
                <p className="text-muted-foreground">{profile.email}</p>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Bio</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)
                    ) : (
                        <p className="text-sm text-muted-foreground">No skills listed.</p>
                    )}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                    {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map(interest => <Badge key={interest} variant="secondary">{interest}</Badge>)
                    ) : (
                        <p className="text-sm text-muted-foreground">No interests listed.</p>
                    )}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Projects ({projects.length})</h2>
        {projects.length > 0 ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(opportunity => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
            </div>
        ) : (
             <Card className="text-center py-12">
                <CardDescription>{profile.displayName} is not yet part of any projects.</CardDescription>
            </Card>
        )}
      </div>

    </div>
  );
}

export default function UserProfilePage({ params }: { params: { uid: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ProfilePageComponent paramsPromise={Promise.resolve(params)} />
    </Suspense>
  );
}
