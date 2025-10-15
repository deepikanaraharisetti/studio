
'use client';

import { useUser } from '@/firebase';
import ProfileForm from '@/components/profile-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { useState } from 'react';

// This page is now a redirector to the dynamic user profile page.
// The actual form is still used for editing, but viewing a profile
// is handled by /users/[uid]
export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      router.replace(`/users/${user.uid}?edit=true`);
    }
  }, [user, router]);


  return null; // or a loading state
}
