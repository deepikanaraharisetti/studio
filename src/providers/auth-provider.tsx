'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import LoadingSpinner from '@/components/loading-spinner';

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithMockUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  loginWithMockUser: () => {},
});

const mockUser = {
    uid: 'mock-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://picsum.photos/seed/avatar1/100/100',
} as User;

const mockUserProfile: UserProfile = {
    uid: 'mock-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://picsum.photos/seed/avatar1/100/100',
    bio: 'This is a mock user profile for testing purposes.',
    skills: ['React', 'TypeScript', 'Next.js'],
    interests: ['Web Development', 'UI/UX Design'],
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithMockUser = () => {
    if (MOCK_AUTH) {
        setLoading(true);
        setUser(mockUser);
        setUserProfile(mockUserProfile);
        setLoading(false);
    }
  };

  useEffect(() => {
    if (MOCK_AUTH) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // Handle case where user is authenticated but has no profile document yet
          const profile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          };
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, userProfile, loading, loginWithMockUser };

  return (
    <AuthContext.Provider value={value}>
      {loading && !MOCK_AUTH ? <LoadingSpinner fullScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
