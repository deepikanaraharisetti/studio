'use client';

import { useAuth } from '@/providers/auth-provider';
import ProfileForm from '@/components/profile-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is now a redirector to the dynamic user profile page.
// The actual form is still used for editing, but viewing a profile
// is handled by /users/[uid]
export default function ProfilePage() {
  const { userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.uid) {
      router.replace(`/users/${userProfile.uid}?edit=true`);
    }
  }, [userProfile, router]);


  return null; // or a loading state
}

    