
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
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
  requiredSkills: z.array(z.object({ value: z.string() })).min(1, 'At least one skill is required'),
  roles: z.array(z.object({ value: z.string() })).min(1, 'At least one role is required'),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

// Helper component for array input fields
function ArrayInput({
  control,
  name,
  label,
  placeholder,
}: {
  control: any;
  name: 'requiredSkills' | 'roles';
  label: string;
  placeholder: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const [inputValue, setInputValue] = useState('');

  const handleAppend = () => {
    if (inputValue && !fields.some(field => (field as any).value === inputValue)) {
      append({ value: inputValue });
      setInputValue('');
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => (
            <Badge key={field.id} variant="secondary" className="text-sm py-1 pl-3 pr-2">
              {(field as any).value}
              <button type="button" onClick={() => remove(index)} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAppend();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAppend}>Add</Button>
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
}

export default function CreateOpportunityForm() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
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
    mode: 'onChange'
  });

  const onSubmit = async (data: OpportunityFormValues) => {
    if (!user || !firestore) {
        toast({ title: 'Error', description: 'You must be logged in to create an opportunity.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);

    const docData = {
      ...data,
      requiredSkills: data.requiredSkills.map(s => s.value), // transform back to array of strings
      roles: data.roles.map(r => r.value), // transform back to array of strings
      ownerId: user.uid,
      ownerName: user.displayName,
      ownerPhotoURL: user.photoURL,
      teamMembers: [],
      joinRequests: [],
      createdAt: serverTimestamp(),
    };
    
    const opportunitiesCollection = collection(firestore, 'opportunities');
    addDoc(opportunitiesCollection, docData)
      .then((docRef) => {
        toast({
          title: 'Opportunity Created!',
          description: 'Your new opportunity is now live.',
        });
        router.push(`/opportunities/${docRef.id}`);
      })
      .catch((error) => {
        setIsLoading(false);
        // This is where we emit the detailed error
        const permissionError = new FirestorePermissionError({
            path: opportunitiesCollection.path,
            operation: 'create',
            requestResourceData: docData,
        });
        errorEmitter.emit('permission-error', permissionError);

        // We can still show a generic toast to the user
        toast({
            title: 'Creation Failed',
            description: 'You do not have permission to create an opportunity. Please check the security rules.',
            variant: 'destructive',
        });
      });
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
                    <ArrayInput
                      control={form.control}
                      name="requiredSkills"
                      label="Required Skills"
                      placeholder="e.g., React, Python, UI/UX Design"
                    />
                  )}
                />
                <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                        <ArrayInput
                        control={form.control}
                        name="roles"
                        label="Open Roles"
                        placeholder="e.g., Frontend Developer, Project Manager"
                        />
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
