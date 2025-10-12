'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { getSuggestedOpportunities } from '@/ai/ai-suggested-opportunities';
import { mockOpportunities } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';


const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      if (MOCK_AUTH) {
        setOpportunities(mockOpportunities);
        setLoading(false);
      } else {
        const opportunitiesCollection = collection(db, 'opportunities');
        const opportunitySnapshot = await getDocs(opportunitiesCollection);
        const opportunitiesList = opportunitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunities(opportunitiesList);
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

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

          // In mock mode, let's just recommend the first 3 if AI returns empty
          if (MOCK_AUTH && recommendedOps.length === 0) {
            setRecommendedOpportunities(opportunities.slice(0, 3));
          } else {
            setRecommendedOpportunities(recommendedOps);
          }

        } catch (error) {
          console.error("Error fetching recommendations:", error);
          // Fallback for mock mode
          if (MOCK_AUTH) {
            setRecommendedOpportunities(opportunities.slice(0,3));
          } else {
            setRecommendedOpportunities([]); // Clear recommendations on error
          }
        } finally {
          setRecommendationsLoading(false);
        }
      } else if (opportunities.length > 0) {
        setRecommendationsLoading(false);
      }
    };

    if (!loading) {
        fetchRecommendations();
    }
  }, [userProfile, opportunities, loading]);

  const filteredOpportunities = opportunities.filter(op => 
    op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedOpportunities = filteredOpportunities.filter(op => !recommendedOpportunities.some(rec => rec.id === op.id));

  return (
    <div className="space-y-8">
      <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome back, {userProfile?.displayName?.split(' ')[0]}!</CardTitle>
          <CardDescription className="text-primary-foreground/80">Here’s what’s happening. Browse projects, join teams, and start collaborating.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by title, skill, or keyword..." 
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 h-11">
          <ListFilter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* AI Recommendation Section */}
      {(recommendationsLoading || recommendedOpportunities.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 tracking-tight">
            <Star className="text-amber-500 fill-amber-400" />
            Recommended For You
          </h2>
          {recommendationsLoading ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {Array.from({ length: 3 }).map((_, i) => <OpportunitySkeleton key={i} />)}
             </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedOpportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">All Opportunities</h2>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <OpportunitySkeleton key={i} />)}
          </div>
        ) : displayedOpportunities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <h3 className="text-lg font-medium">No other opportunities found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or check back later!</p>
          </Card>
        )}
      </div>
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
