'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Star, Briefcase, FolderKanban, Bell, CheckSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { getSuggestedOpportunities } from '@/ai/ai-suggested-opportunities';
import { mockOpportunities, mockUsers } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [stats, setStats] = useState({ yourProjects: 0, joinRequests: 0 });

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      let opportunitiesList: Opportunity[] = [];
      if (MOCK_AUTH) {
        opportunitiesList = mockOpportunities;
        setOpportunities(mockOpportunities);
      } else {
        const opportunitiesCollection = collection(db, 'opportunities');
        const opportunitySnapshot = await getDocs(opportunitiesCollection);
        opportunitiesList = opportunitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunities(opportunitiesList);
      }
      setLoading(false);

      if (userProfile) {
        const owned = MOCK_AUTH 
          ? mockOpportunities.filter(op => op.ownerId === userProfile.uid)
          : opportunitiesList.filter(op => op.ownerId === userProfile.uid);
          
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
          
          if (MOCK_AUTH && recommendedOps.length === 0) {
            setRecommendedOpportunities(opportunities.slice(0, 2));
          } else {
            setRecommendedOpportunities(recommendedOps);
          }

        } catch (error) {
          console.error("Error fetching recommendations:", error);
           if (MOCK_AUTH) {
            setRecommendedOpportunities(opportunities.slice(0,2));
          } else {
            setRecommendedOpportunities([]);
          }
        } finally {
          setRecommendationsLoading(false);
        }
      } else if (opportunities.length > 0) {
        // No user profile, but we have opportunities.
        // Maybe show top 3 opportunities as "recommendations"
        setRecommendedOpportunities(opportunities.slice(0,2));
        setRecommendationsLoading(false);
      }
    };

    if (!loading) {
        fetchRecommendations();
    }
  }, [userProfile, opportunities, loading]);

  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    opportunities.forEach(op => op.requiredSkills.forEach(skill => skillsSet.add(skill)));
    return Array.from(skillsSet).sort();
  }, [opportunities]);

  const allRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    opportunities.forEach(op => op.roles.forEach(role => rolesSet.add(role)));
    return Array.from(rolesSet).sort();
  }, [opportunities]);
  
  const filteredOpportunities = opportunities.filter(op => {
    const searchTermMatch = searchTerm === '' ||
      op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.description.toLowerCase().includes(searchTerm.toLowerCase());

    const skillMatch = selectedSkills.length === 0 || selectedSkills.some(s => op.requiredSkills.includes(s));
    const roleMatch = selectedRoles.length === 0 || selectedRoles.some(r => op.roles.includes(r));

    return searchTermMatch && skillMatch && roleMatch;
  });

  const displayedOpportunities = filteredOpportunities.filter(op => !recommendedOpportunities.some(rec => rec.id === op.id));

  const resetFilters = () => {
    setSelectedSkills([]);
    setSelectedRoles([]);
    setSearchTerm('');
  }
  
  const activeFilterCount = selectedSkills.length + selectedRoles.length + (searchTerm ? 1 : 0);

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
        <StatCard title="Total Opportunities" value={opportunities.length} icon={Briefcase} />
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className='flex-1'>
              <CardTitle className="text-2xl">Explore Opportunities</CardTitle>
              <CardDescription>Search and filter through all available projects.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 h-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10 relative">
                    <ListFilter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{activeFilterCount}</Badge>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <h4 className="font-medium">Filters</h4>
                          <Button variant="ghost" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0}>Reset</Button>
                      </div>
                      <div className="space-y-2">
                          <Label>Skills</Label>
                          <Select onValueChange={(value) => setSelectedSkills(value === 'all' ? [] : [value])} value={selectedSkills[0] || 'all'}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a skill" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value='all'>All Skills</SelectItem>
                                  {allSkills.map(skill => <SelectItem key={skill} value={skill}>{skill}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label>Roles</Label>
                          <Select onValueChange={(value) => setSelectedRoles(value === 'all' ? [] : [value])} value={selectedRoles[0] || 'all'}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value='all'>All Roles</SelectItem>
                                  {allRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No opportunities found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters!</p>
            </div>
          )}
        </CardContent>
      </Card>
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

    