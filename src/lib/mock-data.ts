import { Opportunity, UserProfile } from './types';

const mockUser1: UserProfile = {
    uid: 'user-1',
    displayName: 'Alice Johnson',
    email: 'alice@example.com',
    photoURL: 'https://picsum.photos/seed/avatar2/100/100',
    bio: 'Frontend developer with a passion for beautiful UIs.',
    skills: ['React', 'CSS', 'Design'],
    interests: ['Photography', 'Hiking'],
};

const mockUser2: UserProfile = {
    uid: 'user-2',
    displayName: 'Bob Williams',
    email: 'bob@example.com',
    photoURL: 'https://picsum.photos/seed/avatar3/100/100',
    bio: 'Backend engineer specializing in Node.js and databases.',
    skills: ['Node.js', 'Python', 'PostgreSQL'],
    interests: ['Cooking', 'Chess'],
};

const mockUser3: UserProfile = {
    uid: 'user-3',
    displayName: 'Charlie Brown',
    email: 'charlie@example.com',
    photoURL: 'https://picsum.photos/seed/avatar-man/100/100',
    bio: 'Full-stack dev, loves a good challenge.',
    skills: ['JavaScript', 'Go', 'Docker'],
    interests: ['Gaming', 'Rock Climbing'],
};


export const mockOpportunities: Opportunity[] = [
  {
    id: 'proj-1',
    title: 'Eco-Friendly Campus Initiative',
    description: 'A project to implement sustainable practices across campus, including recycling programs, energy conservation efforts, and green workshops. We are looking for passionate individuals to help us make a difference.',
    ownerId: 'owner-1',
    ownerName: 'Jane Doe',
    ownerPhotoURL: 'https://picsum.photos/seed/avatar1/100/100',
    requiredSkills: ['Project Management', 'Marketing', 'Environmental Science'],
    roles: ['Project Lead', 'Marketing Coordinator', 'Research Analyst'],
    teamMembers: [mockUser1],
    joinRequests: [mockUser3],
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any, // Mock Timestamp
  },
  {
    id: 'proj-2',
    title: 'AI-Powered Study Buddy App',
    description: 'Developing a mobile application that uses AI to create personalized study plans and tutoring sessions for students. Seeking developers and UI/UX designers to bring this idea to life.',
    ownerId: 'mock-user-id', // Make the test user the owner
    ownerName: 'Test User',
    ownerPhotoURL: 'https://picsum.photos/seed/avatar1/100/100',
    requiredSkills: ['React Native', 'Firebase', 'UI/UX Design', 'Machine Learning'],
    roles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
    teamMembers: [mockUser2, mockUser1],
    joinRequests: [mockUser3],
    createdAt: { seconds: 1675209600, nanoseconds: 0 } as any,
  },
  {
    id: 'proj-3',
    title: 'Annual Charity Hackathon',
    description: "Organizing the university's largest hackathon focused on creating tech solutions for non-profits. We need help with logistics, sponsorships, and mentoring participants.",
    ownerId: 'owner-3',
    ownerName: 'Emily Clark',
    ownerPhotoURL: 'https://picsum.photos/seed/avatar5/100/100',
    requiredSkills: ['Event Planning', 'Sponsorship', 'Software Development'],
    roles: ['Event Organizer', 'Sponsorship Manager', 'Mentor'],
    teamMembers: [],
    joinRequests: [],
    createdAt: { seconds: 1677628800, nanoseconds: 0 } as any,
  },
   {
    id: 'proj-4',
    title: 'Campus Photography Club Website',
    description: 'Creating a modern, visually appealing website for the campus photography club to showcase member portfolios, announce events, and share resources. We need web developers and designers with a good eye.',
    ownerId: 'owner-4',
    ownerName: 'Michael Brown',
    ownerPhotoURL: 'https://picsum.photos/seed/avatar-man/100/100',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Web Design'],
    roles: ['Web Developer', 'UI Designer'],
    teamMembers: [mockUser1],
    joinRequests: [],
    createdAt: { seconds: 1679443200, nanoseconds: 0 } as any,
  },
  {
    id: 'proj-5',
    title: 'Peer-to-Peer Tutoring Platform',
    description: 'A platform to connect students who need academic help with those who can provide it. Looking for full-stack developers and a product manager to build and launch the MVP.',
    ownerId: 'owner-5',
    ownerName: 'Sarah Davis',
    ownerPhotoURL: 'https://picsum.photos/seed/avatar-woman-2/100/100',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Product Management'],
    roles: ['Full-Stack Developer', 'Product Manager'],
    teamMembers: [mockUser2],
    joinRequests: [],
    createdAt: { seconds: 1680307200, nanoseconds: 0 } as any,
  },
  {
    id: 'proj-6',
    title: 'Short Film Production',
    description: "We're producing a short-film for the annual film festival. We need a crew! Looking for actors, a cinematographer, a sound engineer, and an editor to collaborate on this creative project.",
    ownerId: 'owner-6',
    ownerName: 'David Wilson',
    ownerPhotoURL: 'https://picsum.photos/seed/avatar-man-2/100/100',
    requiredSkills: ['Acting', 'Cinematography', 'Sound Design', 'Video Editing'],
    roles: ['Actor', 'Cinematographer', 'Editor'],
    teamMembers: [],
    joinRequests: [],
    createdAt: { seconds: 1682899200, nanoseconds: 0 } as any,
  },
];
