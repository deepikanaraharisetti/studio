'use client';

import { useAuth } from '@/providers/auth-provider';
import ProfileForm from '@/components/profile-form';

export default function ProfilePage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return null; // or a loading state
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>
      <ProfileForm userProfile={userProfile} />
    </div>
  );
}
