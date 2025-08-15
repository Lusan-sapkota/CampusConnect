export interface Post {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  category: 'academic' | 'social' | 'announcement' | 'general';
}

export const posts: Post[] = [
  {
    id: '1',
    title: 'Study Group for CS 101 Final Exam',
    description: 'Hey everyone! I\'m organizing a study group for the CS 101 final exam next week. We\'ll be meeting in the library on Saturday at 2 PM. Bring your notes and let\'s ace this together!',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'Computer Science Student'
    },
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    category: 'academic'
  },
  {
    id: '2',
    title: 'Campus Coffee Shop Opens Tomorrow!',
    description: 'Exciting news! The new Brew & Books café is opening tomorrow in the Student Union building. They\'ll be serving locally roasted coffee and offering 20% discount to all students with valid ID!',
    author: {
      name: 'Campus News',
      avatar: 'https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'Official Account'
    },
    timestamp: '4 hours ago',
    likes: 156,
    comments: 32,
    category: 'announcement'
  },
  {
    id: '3',
    title: 'Looking for Basketball Players',
    description: 'Our intramural basketball team needs 2 more players for the upcoming season. We practice Tuesdays and Thursdays at 6 PM. No experience necessary, just bring your enthusiasm!',
    author: {
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'Sports Management Student'
    },
    timestamp: '1 day ago',
    likes: 43,
    comments: 15,
    category: 'social'
  },
  {
    id: '4',
    title: 'Free Tutoring Available',
    description: 'The Academic Success Center is offering free tutoring sessions for Math, Physics, and Chemistry. Sessions are available Monday through Friday, 10 AM to 8 PM. Book your slot online!',
    author: {
      name: 'Academic Success Center',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'Campus Resource'
    },
    timestamp: '2 days ago',
    likes: 89,
    comments: 12,
    category: 'academic'
  }
];