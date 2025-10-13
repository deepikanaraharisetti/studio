'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import { useAuth } from '@/providers/auth-provider';
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyProjectsPage() {
  const { userProfile } = useAuth();
  const [opportunitiesList, setOpportunitiesList] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const q = query(collection(db, "opportunities"), where("ownerId", "==", userProfile.uid));
        const querySnapshot = await getDocs(q);
        const opportunities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunitiesList(opportunities);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [userProfile]);

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

      {opportunitiesList.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunitiesList.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border">
            <h3 className="text-lg font-medium">You haven't created any projects yet.</h3>
            <p className="text-muted-foreground">Get started by creating a new opportunity!</p>
        </div>
      )}
    </div>
  );
}
