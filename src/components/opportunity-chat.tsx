'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { ChatMessage } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from './loading-spinner';
import { formatDistanceToNow } from 'date-fns';
import { Send, Lock } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface OpportunityChatProps {
  opportunityId: string;
  isMember: boolean;
}

export default function OpportunityChat({ opportunityId, isMember }: OpportunityChatProps) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesCol = collection(db, 'opportunities', opportunityId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [opportunityId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;

    const messageData = {
      text: newMessage,
      senderId: userProfile.uid,
      senderName: userProfile.displayName,
      senderPhotoURL: userProfile.photoURL,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'opportunities', opportunityId, 'messages'), messageData);

    setNewMessage('');
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!isMember) {
    return (
        <Card className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4"/>
                <p className="font-semibold">Chat is for team members only.</p>
                <p>Join the team to participate in the conversation.</p>
            </div>
        </Card>
    )
  }

  return (
    <Card className="h-[32rem] flex flex-col">
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {loading ? (
              <LoadingSpinner />
            ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground pt-16">
                    <p>No messages yet.</p>
                    <p>Be the first to say hello!</p>
                </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={msg.senderPhotoURL || ''} />
                    <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold">{msg.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'sending...'}
                      </p>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
