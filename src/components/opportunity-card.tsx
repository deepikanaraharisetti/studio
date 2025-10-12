import Link from 'next/link';
import { Opportunity } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {

  return (
    <Link href={`/opportunities/${opportunity.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-snug group-hover:text-primary">
            {opportunity.title}
          </CardTitle>
          <CardDescription className="text-sm">by {opportunity.ownerName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {opportunity.description}
          </p>
          <div className="flex flex-wrap gap-1 pt-2">
            {opportunity.requiredSkills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
            {opportunity.requiredSkills.length > 3 && (
                <Badge variant="outline">+{opportunity.requiredSkills.length - 3}</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center text-sm text-muted-foreground">
           <div className="flex items-center gap-2">
             <Users className="h-4 w-4"/>
             <span>{opportunity.teamMembers.length + 1} Member{opportunity.teamMembers.length + 1 === 1 ? '' : 's'}</span>
           </div>
          <div className="flex items-center -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-card">
                <AvatarImage src={opportunity.ownerPhotoURL} />
                <AvatarFallback>{getInitials(opportunity.ownerName)}</AvatarFallback>
            </Avatar>
            {opportunity.teamMembers.slice(0,2).map(member => (
              <Avatar key={member.uid} className="h-8 w-8 border-2 border-card">
                <AvatarImage src={member.photoURL || ''} />
                <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
              </Avatar>
            ))}
             {opportunity.teamMembers.length > 2 && (
                <Avatar className="h-8 w-8 border-2 border-card bg-muted-foreground text-background">
                    <AvatarFallback className="text-xs font-semibold">+{opportunity.teamMembers.length - 2}</AvatarFallback>
                </Avatar>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
