import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  skills?: string[];
  interests?: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  description:string;
  ownerId: string;
  ownerName: string;
  ownerPhotoURL: string;
  requiredSkills: string[];
  roles: string[];
  teamMembers: UserProfile[];
  joinRequests: UserProfile[];
  createdAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string | null;
  senderPhotoURL: string | null;
  createdAt: Timestamp;
}

export interface ProjectFile {
    id: string;
    name: string;
    url: string;
    uploaderId: string;
    uploaderName: string | null;
    createdAt: Timestamp;
}
