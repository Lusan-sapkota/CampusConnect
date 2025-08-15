export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'social' | 'sports' | 'arts' | 'career';
  organizer: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  tags: string[];
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Tech Career Fair 2024',
    description: 'Connect with top tech companies and explore internship and full-time opportunities. Over 50 companies will be present including Google, Microsoft, Apple, and many exciting startups.',
    date: '2024-02-15',
    time: '10:00 AM - 4:00 PM',
    location: 'Student Union Grand Ballroom',
    category: 'career',
    organizer: 'Career Services Center',
    attendees: 234,
    maxAttendees: 500,
    image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['networking', 'careers', 'technology']
  },
  {
    id: '2',
    title: 'Spring Music Festival',
    description: 'Join us for an amazing evening of live music featuring local bands and student performers. Food trucks, games, and great music await!',
    date: '2024-02-20',
    time: '6:00 PM - 11:00 PM',
    location: 'Campus Green',
    category: 'arts',
    organizer: 'Student Activities Board',
    attendees: 412,
    maxAttendees: 1000,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['music', 'entertainment', 'festival']
  },
  {
    id: '3',
    title: 'Hackathon 2024: Code for Change',
    description: '48-hour coding marathon where students build solutions for real-world problems. Prizes worth $10,000 and mentorship from industry experts.',
    date: '2024-02-25',
    time: '9:00 AM - 9:00 PM (3 days)',
    location: 'Engineering Building',
    category: 'academic',
    organizer: 'Computer Science Department',
    attendees: 89,
    maxAttendees: 200,
    image: 'https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['coding', 'innovation', 'competition']
  },
  {
    id: '4',
    title: 'International Food Festival',
    description: 'Taste authentic cuisines from around the world prepared by our international student community. Learn about different cultures through food!',
    date: '2024-03-02',
    time: '12:00 PM - 6:00 PM',
    location: 'Student Union Plaza',
    category: 'social',
    organizer: 'International Student Association',
    attendees: 178,
    maxAttendees: 300,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['food', 'culture', 'international']
  },
  {
    id: '5',
    title: 'Campus Sustainability Workshop',
    description: 'Learn practical ways to make our campus more sustainable. Topics include waste reduction, energy conservation, and green transportation.',
    date: '2024-03-08',
    time: '2:00 PM - 4:00 PM',
    location: 'Environmental Science Building',
    category: 'academic',
    organizer: 'Sustainability Club',
    attendees: 45,
    maxAttendees: 80,
    image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['sustainability', 'environment', 'workshop']
  }
];