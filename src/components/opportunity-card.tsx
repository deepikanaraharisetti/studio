import Link from 'next/link';
import { Opportunity, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function TeamMemberPopover({ user }: { user: UserProfile }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-card cursor-pointer">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={`/users/${user.uid}`} className="font-semibold hover:underline">{user.displayName}</Link>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const ownerProfile: UserProfile = {
      uid: opportunity.ownerId,
      displayName: opportunity.ownerName,
      photoURL: opportunity.ownerPhotoURL,
      email: '' // Not available in opportunity data
  }

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50 group">
      <CardHeader>
        <CardTitle className="text-lg font-semibold leading-snug">
           <Link href={`/opportunities/${opportunity.id}`} className="hover:text-primary stretched-link">{opportunity.title}</Link>
        </CardTitle>
        <CardDescription className="text-sm">
            by <Link href={`/users/${opportunity.ownerId}`} className="font-medium text-card-foreground hover:underline">{opportunity.ownerName}</Link>
        </CardDescription>
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
          <TeamMemberPopover user={ownerProfile} />
          {opportunity.teamMembers.slice(0,2).map(member => (
            <TeamMemberPopover key={member.uid} user={member} />
          ))}
           {opportunity.teamMembers.length > 2 && (
              <Avatar className="h-8 w-8 border-2 border-card bg-muted-foreground/80 text-background">
                  <AvatarFallback className="text-xs font-semibold">+{opportunity.teamMembers.length - 2}</AvatarFallback>
              </Avatar>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

    