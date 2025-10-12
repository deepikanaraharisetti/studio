import { Opportunity, UserProfile } from './types';

export const mockUsers: UserProfile[] = [
  {
    uid: 'owner-1',
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    photoURL: 'https://picsum.photos/seed/avatar1/100/100',
    bio: 'Visionary leader and project owner, passionate about sustainability and tech for good. Always looking for innovative ideas.',
    skills: ['Leadership', 'Public Speaking', 'Strategy'],
    interests: ['Green Tech', 'Volunteering'],
  },
  {
    uid: 'user-1',
    displayName: 'Alice Johnson',
    email: 'alice@example.com',
    photoURL: 'https://picsum.photos/seed/avatar2/100/100',
    bio: 'Frontend developer with a passion for creating beautiful, intuitive user interfaces. I love bringing ideas to life with code and design.',
    skills: ['React', 'CSS', 'UI Design', 'JavaScript'],
    interests: ['Photography', 'Hiking', 'Minimalist Design'],
  },
  {
    uid: 'user-2',
    displayName: 'Bob Williams',
    email: 'bob@example.com',
    photoURL: 'https://picsum.photos/seed/avatar3/100/100',
    bio: 'Backend engineer specializing in Node.js and building scalable database architectures. I enjoy solving complex problems.',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'System Architecture'],
    interests: ['Cooking', 'Chess', 'Data Science'],
  },
  {
    uid: 'user-3',
    displayName: 'Charlie Brown',
    email: 'charlie@example.com',
    photoURL: 'https://picsum.photos/seed/avatar-man/100/100',
    bio: 'Full-stack developer who loves a good challenge. Eager to learn new technologies and collaborate with a great team.',
    skills: ['JavaScript', 'Go', 'Docker', 'Kubernetes'],
    interests: ['Gaming', 'Rock Climbing', 'Open Source'],
  },
  {
    uid: 'owner-3',
    displayName: 'Emily Clark',
    email: 'emily@example.com',
    photoURL: 'https://picsum.photos/seed/avatar5/100/100',
    bio: 'Community organizer and event planner. My goal is to bring people together to build amazing things.',
    skills: ['Event Planning', 'Community Management', 'Sponsorship'],
    interests: ['Social Good', 'Hackathons'],
  },
  {
    uid: 'owner-4',
    displayName: 'Michael Brown',
    email: 'michael@example.com',
    photoURL: 'https://picsum.photos/seed/avatar-man/100/100',
    bio: 'Photographer and web designer. I capture moments and build websites that tell stories.',
    skills: ['Photography', 'Web Design', 'HTML', 'CSS'],
    interests: ['Art', 'Travel'],
  },
  {
    uid: 'owner-5',
    displayName: 'Sarah Davis',
    email: 'sarah@example.com',
    photoURL: 'https://picsum.photos/seed/avatar-woman-2/100/100',
    bio: 'Product manager with a focus on user-centric design. I help teams build products that users love.',
    skills: ['Product Management', 'Agile', 'User Research'],
    interests: ['EdTech', 'Startups'],
  },
  {
    uid: 'owner-6',
    displayName: 'David Wilson',
    email: 'dave@example.com',
    photoURL: 'https://picsum.photos/seed/avatar-man-2/100/100',
    bio: 'Filmmaker and storyteller. I love bringing narratives to life through the medium of film.',
    skills: ['Filmmaking', 'Video Editing', 'Storytelling'],
    interests: ['Cinema', 'Creative Writing'],
  },
  {
    uid: 'mock-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://picsum.photos/seed/avatar-test/100/100',
    bio: 'This is a mock user profile for testing purposes.',
    skills: ['React', 'TypeScript', 'Next.js', 'Firebase'],
    interests: ['Web Development', 'UI/UX Design', 'Testing'],
  },
];

const mockUser1 = mockUsers.find(u => u.uid === 'user-1')!;
const mockUser2 = mockUsers.find(u => u.uid === 'user-2')!;
const mockUser3 = mockUsers.find(u => u.uid === 'user-3')!;
const owner1 = mockUsers.find(u => u.uid === 'owner-1')!;
const owner3 = mockUsers.find(u => u.uid === 'owner-3')!;
const owner4 = mockUsers.find(u => u.uid === 'owner-4')!;
const owner5 = mockUsers.find(u => u.uid === 'owner-5')!;
const owner6 = mockUsers.find(u => u.uid === 'owner-6')!;
const testUser = mockUsers.find(u => u.uid === 'mock-user-id')!;

export const mockOpportunities: Opportunity[] = [
  {
    id: 'proj-1',
    title: 'Eco-Friendly Campus Initiative',
    description: 'A project to implement sustainable practices across campus, including recycling programs, energy conservation efforts, and green workshops. We are looking for passionate individuals to help us make a difference.',
    ownerId: owner1.uid,
    ownerName: owner1.displayName!,
    ownerPhotoURL: owner1.photoURL!,
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
    ownerId: testUser.uid, 
    ownerName: testUser.displayName!,
    ownerPhotoURL: testUser.photoURL!,
    requiredSkills: ['React Native', 'Firebase', 'UI/UX Design', 'Machine Learning'],
    roles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
    teamMembers: [mockUser2, mockUser1],
    joinRequests: [mockUser3, mockUser2],
    createdAt: { seconds: 1675209600, nanoseconds: 0 } as any,
  },
  {
    id: 'proj-3',
    title: 'Annual Charity Hackathon',
    description: "Organizing the university's largest hackathon focused on creating tech solutions for non-profits. We need help with logistics, sponsorships, and mentoring participants.",
    ownerId: owner3.uid,
    ownerName: owner3.displayName!,
    ownerPhotoURL: owner3.photoURL!,
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
    ownerId: owner4.uid,
    ownerName: owner4.displayName!,
    ownerPhotoURL: owner4.photoURL!,
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
    ownerId: owner5.uid,
    ownerName: owner5.displayName!,
    ownerPhotoURL: owner5.photoURL!,
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
    ownerId: owner6.uid,
    ownerName: owner6.displayName!,
    ownerPhotoURL: owner6.photoURL!,
    requiredSkills: ['Acting', 'Cinematography', 'Sound Design', 'Video Editing'],
    roles: ['Actor', 'Cinematographer', 'Editor'],
    teamMembers: [],
    joinRequests: [],
    createdAt: { seconds: 1682899200, nanoseconds: 0 } as any,
  },
];

    