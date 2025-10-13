'use client';

import { useState, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from './loading-spinner';
import { X } from 'lucide-react';

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

export default function CreateOpportunityForm() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: '',
      description: '',
      requiredSkills: [],
      roles: [],
    },
  });

  const handleArrayInput = (e: KeyboardEvent<HTMLInputElement>, field: 'requiredSkills' | 'roles') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      const newValue = input.value.trim();
      const currentValues = form.getValues(field);
      if (newValue && !currentValues.includes(newValue)) {
        form.setValue(field, [...currentValues, newValue]);
        input.value = '';
      }
    }
  };

  const removeFromArray = (valueToRemove: string, field: 'requiredSkills' | 'roles') => {
    const currentValues = form.getValues(field);
    form.setValue(field, currentValues.filter(value => value !== valueToRemove));
  };

  const onSubmit = async (data: OpportunityFormValues) => {
    if (!userProfile) {
        toast({ title: 'Error', description: 'You must be logged in to create an opportunity.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);

    try {
        await addDoc(collection(db, 'opportunities'), {
            ...data,
            ownerId: userProfile.uid,
            ownerName: userProfile.displayName,
            ownerPhotoURL: userProfile.photoURL,
            teamMembers: [],
            joinRequests: [],
            createdAt: serverTimestamp(),
        });

      toast({
        title: 'Opportunity Created!',
        description: 'Your new opportunity is now live.',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Creation Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Opportunity Details</CardTitle>
                <CardDescription>Provide the core details about your project or team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Build a Mobile App for Campus Events" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Describe your project, goals, and what you're looking for in team members." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Skills & Roles</CardTitle>
                <CardDescription>Specify the expertise and roles needed for your team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="requiredSkills"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Required Skills</FormLabel>
                        <FormControl>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {field.value.map(skill => (
                                    <Badge key={skill} variant="secondary" className="text-sm py-1 pl-3 pr-2">
                                        {skill}
                                        <button type="button" onClick={() => removeFromArray(skill, 'requiredSkills')} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5">
                                        <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                    ))}
                                </div>
                                <Input
                                    placeholder="e.g., React, Python, UI/UX Design (press Enter to add)"
                                    onKeyDown={(e) => handleArrayInput(e, 'requiredSkills')}
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Open Roles</FormLabel>
                        <FormControl>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {field.value.map(role => (
                                    <Badge key={role} variant="secondary" className="text-sm py-1 pl-3 pr-2">
                                        {role}
                                        <button type="button" onClick={() => removeFromArray(role, 'roles')} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5">
                                        <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                    ))}
                                </div>
                                <Input
                                    placeholder="e.g., Frontend Developer, Project Manager (press Enter to add)"
                                    onKeyDown={(e) => handleArrayInput(e, 'roles')}
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="h-4 w-4" /> : 'Publish Opportunity'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
