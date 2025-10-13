'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import { Briefcase, Star, FolderKanban, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { getSuggestedOpportunities } from '@/ai/ai-suggested-opportunities';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [stats, setStats] = useState({ yourProjects: 0, joinRequests: 0 });

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      const opportunitiesCollection = collection(db, 'opportunities');
      const opportunitySnapshot = await getDocs(opportunitiesCollection);
      const opportunitiesList = opportunitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
      setOpportunities(opportunitiesList);
      setLoading(false);

      if (userProfile) {
        const owned = opportunitiesList.filter(op => op.ownerId === userProfile.uid);
        const requests = owned.reduce((acc, op) => acc + (op.joinRequests?.length || 0), 0);
        setStats({ yourProjects: owned.length, joinRequests: requests });
      }
    };

    fetchOpportunities();
  }, [userProfile]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (userProfile && opportunities.length > 0) {
        setRecommendationsLoading(true);
        try {
          const profileString = `Skills: ${userProfile.skills?.join(', ') || 'none'}, Interests: ${userProfile.interests?.join(', ') || 'none'}`;
          const opportunitiesString = JSON.stringify(opportunities.map(o => ({ id: o.id, title: o.title, description: o.description, requiredSkills: o.requiredSkills })));
          
          const suggestions = await getSuggestedOpportunities({
            userProfile: profileString,
            opportunities: opportunitiesString,
          });

          const recommendedOps = suggestions.map(suggestion => {
            return opportunities.find(op => op.id === suggestion.opportunityId);
          }).filter((op): op is Opportunity => !!op);
          
          setRecommendedOpportunities(recommendedOps);

        } catch (error) {
          console.error("Error fetching recommendations:", error);
          setRecommendedOpportunities([]);
        } finally {
          setRecommendationsLoading(false);
        }
      } else if (opportunities.length > 0) {
        setRecommendedOpportunities(opportunities.slice(0,2));
        setRecommendationsLoading(false);
      }
    };

    if (!loading) {
        fetchRecommendations();
    }
  }, [userProfile, opportunities, loading]);

  const StatCard = ({ title, value, icon, link }: { title: string, value: number, icon: React.ElementType, link?: string }) => {
    const CardContentWrapper = ({children}: {children: React.ReactNode}) => link ? <Link href={link}>{children}</Link> : <div>{children}</div>;
    return (
      <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
        <CardContentWrapper>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {React.createElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12"/> : value}</div>
          </CardContent>
        </CardContentWrapper>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Explorer'}!</CardTitle>
          <CardDescription className="text-primary-foreground/80">Here’s what’s happening. Browse projects, join teams, and start collaborating.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Opportunities" value={opportunities.length} icon={Briefcase} link="/explore" />
        <StatCard title="Your Projects" value={stats.yourProjects} icon={FolderKanban} link="/my-projects"/>
        <StatCard title="Pending Requests" value={stats.joinRequests} icon={Bell} link="/my-projects"/>
      </div>
      
      {(recommendationsLoading || recommendedOpportunities.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 tracking-tight">
            <Star className="text-amber-500 fill-amber-400" />
            Recommended For You
          </h2>
          {recommendationsLoading ? (
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
               {Array.from({ length: 2 }).map((_, i) => <OpportunitySkeleton key={i} />)}
             </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {recommendedOpportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const OpportunitySkeleton = () => (
    <Card className="p-4 space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center -space-x-2">
                <Skeleton className="h-8 w-8 rounded-full border-2 border-card" />
                <Skeleton className="h-8 w-8 rounded-full border-2 border-card" />
            </div>
            <Skeleton className="h-8 w-24" />
        </div>
    </Card>
);
