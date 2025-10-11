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

export default function DashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

      {/* AI Recommendation Section Placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Star className="text-accent" />
          Recommended For You
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <OpportunitySkeleton key={i} />)
          ) : (
            filteredOpportunities.slice(0, 3).map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))
          )}
        </div>
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
        <Skeleton className="h-40 w-full rounded-md" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
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
)
