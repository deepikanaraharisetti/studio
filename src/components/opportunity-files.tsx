'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { ProjectFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from './loading-spinner';
import { format } from 'date-fns';
import { Upload, File, Download, Lock } from 'lucide-react';
import Link from 'next/link';

interface OpportunityFilesProps {
  opportunityId: string;
  isMember: boolean;
}

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

const mockFiles: ProjectFile[] = [
    { id: 'file-1', name: 'project-brief.pdf', url: '#', uploaderId: 'owner-1', uploaderName: 'Jane Doe', createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24) } as any },
    { id: 'file-2', name: 'design-mockups-v1.zip', url: '#', uploaderId: 'user-1', uploaderName: 'Alice Johnson', createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 30) } as any },
];

export default function OpportunityFiles({ opportunityId, isMember }: OpportunityFilesProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     if (MOCK_AUTH) {
        setFiles(mockFiles);
        setLoading(false);
        return;
    }
    const filesCol = collection(db, 'opportunities', opportunityId, 'files');
    const q = query(filesCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectFile));
      setFiles(fetchedFiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [opportunityId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userProfile) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      if (MOCK_AUTH) {
        const newFile: ProjectFile = {
            id: String(Date.now()),
            name: file.name,
            url: '#',
            uploaderId: userProfile.uid,
            uploaderName: userProfile.displayName,
            createdAt: { toDate: () => new Date() } as any
        };
        setFiles(prev => [newFile, ...prev]);
        toast({ title: 'File Uploaded (Mock)', description: `${file.name} has been added.` });
        setIsUploading(false);
        return;
      }

      try {
        const storageRef = ref(storage, `opportunities/${opportunityId}/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        await addDoc(collection(db, 'opportunities', opportunityId, 'files'), {
          name: file.name,
          url: downloadURL,
          uploaderId: userProfile.uid,
          uploaderName: userProfile.displayName,
          createdAt: serverTimestamp(),
        });

        toast({ title: 'File Uploaded', description: `${file.name} has been shared with the team.` });
      } catch (error) {
        toast({ title: 'Upload Failed', description: 'Could not upload the file. Please try again.', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!isMember) {
    return (
        <Card className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4"/>
                <p className="font-semibold">Files are for team members only.</p>
                <p>Join the team to access and share project files.</p>
            </div>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Files</CardTitle>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <LoadingSpinner className="h-4 w-4"/> : <Upload className="h-4 w-4 mr-2"/>}
            Upload File
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? <LoadingSpinner /> : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Uploader</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No files have been uploaded yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        files.map(file => (
                            <TableRow key={file.id}>
                                <TableCell className="font-medium flex items-center gap-2"><File className="h-4 w-4 text-muted-foreground"/>{file.name}</TableCell>
                                <TableCell>{file.uploaderName}</TableCell>
                                <TableCell>{file.createdAt ? format(file.createdAt.toDate(), 'PPP') : ''}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name}>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
