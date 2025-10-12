'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity, UserProfile } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { getSuggestedOpportunities } from '@/ai/ai-suggested-opportunities';

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
      const opportunitiesCollection = collection(db, 'opportunities');
      const opportunitySnapshot = await getDocs(opportunitiesCollection);
      const opportunitiesList = opportunitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
      setOpportunities(opportunitiesList);
      setLoading(false);
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

          setRecommendedOpportunities(recommendedOps);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
          setRecommendedOpportunities([]); // Clear recommendations on error
        } finally {
          setRecommendationsLoading(false);
        }
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discover Opportunities</h1>
        <p className="text-muted-foreground">Browse projects, join teams, and start collaborating.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by title, skill, or keyword..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <ListFilter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* AI Recommendation Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Star className="text-accent" />
          Recommended For You
        </h2>
        {recommendationsLoading ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {Array.from({ length: 3 }).map((_, i) => <OpportunitySkeleton key={i} />)}
           </div>
        ) : recommendedOpportunities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-card rounded-lg">
            <h3 className="text-lg font-medium">No recommendations for you yet</h3>
            <p className="text-muted-foreground">Complete your profile to get better suggestions.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Opportunities</h2>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <OpportunitySkeleton key={i} />)}
          </div>
        ) : filteredOpportunities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No opportunities found</h3>
            <p className="text-muted-foreground">Try adjusting your search or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const OpportunitySkeleton = () => (
    <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-md" />
        </div>
    </div>
);