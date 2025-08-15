export interface Group {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'social' | 'sports' | 'arts' | 'service' | 'professional';
  members: number;
  image: string;
  meetingTime: string;
  location: string;
  contact: string;
  tags: string[];
}

export const groups: Group[] = [
  {
    id: '1',
    name: 'Robotics Club',
    description: 'Build, program, and compete with robots! We participate in national competitions and work on innovative projects. Perfect for engineering and computer science students.',
    category: 'academic',
    members: 45,
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Wednesdays 7:00 PM',
    location: 'Engineering Lab 204',
    contact: 'robotics@campus.edu',
    tags: ['STEM', 'competition', 'technology']
  },
  {
    id: '2',
    name: 'Drama Society',
    description: 'Express yourself through theater! We produce 3 major shows per year and offer opportunities for acting, directing, set design, and technical theater.',
    category: 'arts',
    members: 78,
    image: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Tuesdays & Thursdays 6:00 PM',
    location: 'Theater Arts Building',
    contact: 'drama@campus.edu',
    tags: ['theater', 'performance', 'creativity']
  },
  {
    id: '3',
    name: 'Environmental Action Group',
    description: 'Making our campus and community more sustainable. We organize clean-up events, sustainability workshops, and advocate for environmental policies.',
    category: 'service',
    members: 67,
    image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Mondays 5:30 PM',
    location: 'Student Union Room 240',
    contact: 'green@campus.edu',
    tags: ['environment', 'activism', 'community']
  },
  {
    id: '4',
    name: 'Business Network Society',
    description: 'Connect with future business leaders and industry professionals. We host networking events, guest speaker sessions, and career development workshops.',
    category: 'professional',
    members: 123,
    image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Fridays 4:00 PM',
    location: 'Business School Auditorium',
    contact: 'business@campus.edu',
    tags: ['networking', 'career', 'business']
  },
  {
    id: '5',
    name: 'Ultimate Frisbee Club',
    description: 'Fast-paced, fun, and competitive ultimate frisbee. We practice regularly and compete in regional tournaments. All skill levels welcome!',
    category: 'sports',
    members: 34,
    image: 'https://images.pexels.com/photos/606539/pexels-photo-606539.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Tuesdays & Saturdays 4:00 PM',
    location: 'Campus Recreation Fields',
    contact: 'frisbee@campus.edu',
    tags: ['sports', 'fitness', 'competition']
  },
  {
    id: '6',
    name: 'Cultural Exchange Club',
    description: 'Celebrate diversity and learn about different cultures. We organize cultural events, language exchange programs, and international friendship activities.',
    category: 'social',
    members: 89,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Thursdays 6:30 PM',
    location: 'International House',
    contact: 'cultural@campus.edu',
    tags: ['culture', 'diversity', 'international']
  },
  {
    id: '7',
    name: 'Photography Society',
    description: 'Capture the world through your lens! Weekly photo walks, workshops on technique and editing, and annual photography exhibition.',
    category: 'arts',
    members: 56,
    image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Sundays 2:00 PM',
    location: 'Art Building Studio 3',
    contact: 'photo@campus.edu',
    tags: ['photography', 'art', 'creativity']
  },
  {
    id: '8',
    name: 'Volunteer Corps',
    description: 'Make a difference in our community! We coordinate volunteer opportunities at local nonprofits, organize service projects, and promote civic engagement.',
    category: 'service',
    members: 112,
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400',
    meetingTime: 'Wednesdays 7:30 PM',
    location: 'Community Service Center',
    contact: 'volunteer@campus.edu',
    tags: ['service', 'community', 'volunteer']
  }
];