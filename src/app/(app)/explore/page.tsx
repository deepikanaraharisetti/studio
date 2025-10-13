'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Opportunity } from '@/lib/types';
import OpportunityCard from '@/components/opportunity-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ExplorePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
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

  const resetFilters = () => {
    setSelectedSkills([]);
    setSelectedRoles([]);
    setSearchTerm('');
  }
  
  const activeFilterCount = selectedSkills.length + selectedRoles.length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-8">
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
          ) : filteredOpportunities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map(opportunity => (
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
