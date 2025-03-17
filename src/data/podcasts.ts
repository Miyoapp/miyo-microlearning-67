
import { Podcast, Category } from '../types';

export const categories: Category[] = [
  'Productivity',
  'Business',
  'Technology',
  'Personal Development',
  'Health',
  'Design',
  'Marketing'
];

export const podcasts: Podcast[] = [
  {
    id: '1',
    title: 'Mastering Time Management',
    creator: {
      id: 'c1',
      name: 'Emma Wilson',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 62, // 62 minutes total
    lessonCount: 5,
    category: 'Productivity',
    imageUrl: 'https://images.unsplash.com/photo-1584661156681-540e80a161d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Learn the most effective techniques to manage your time efficiently and boost your productivity like never before.',
    lessons: [
      {
        id: 'l1-1',
        title: 'Understanding Your Relationship with Time',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l1-2',
        title: 'The Pomodoro Technique',
        duration: 14,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l1-3',
        title: 'Time Blocking Method',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l1-4',
        title: 'Digital Tools for Time Management',
        duration: 15,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l1-5',
        title: 'Creating Sustainable Habits',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '2',
    title: 'UX Design Essentials',
    creator: {
      id: 'c2',
      name: 'Alex Chen',
      imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 45,
    lessonCount: 4,
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'A comprehensive introduction to user experience design principles that will help you create more intuitive and user-friendly interfaces.',
    lessons: [
      {
        id: 'l2-1',
        title: 'The Foundation of Good UX',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l2-2',
        title: 'User Research Techniques',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l2-3',
        title: 'Wireframing and Prototyping',
        duration: 13,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l2-4',
        title: 'Usability Testing',
        duration: 9,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '3',
    title: 'Introduction to AI',
    creator: {
      id: 'c3',
      name: 'Michael Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 53,
    lessonCount: 5,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Understand the basics of artificial intelligence and machine learning, and how these technologies are transforming our world.',
    lessons: [
      {
        id: 'l3-1',
        title: 'What is Artificial Intelligence?',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l3-2',
        title: 'Machine Learning Fundamentals',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l3-3',
        title: 'Neural Networks Explained',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l3-4',
        title: 'AI Applications in Daily Life',
        duration: 8,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l3-5',
        title: 'The Future of AI',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '4',
    title: 'Mindfulness for Beginners',
    creator: {
      id: 'c4',
      name: 'Sarah Lee',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 40,
    lessonCount: 4,
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Learn practical mindfulness techniques to reduce stress, improve focus, and enhance overall well-being in your daily life.',
    lessons: [
      {
        id: 'l4-1',
        title: 'Introduction to Mindfulness',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l4-2',
        title: 'Mindful Breathing Techniques',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l4-3',
        title: 'Body Scan Meditation',
        duration: 9,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l4-4',
        title: 'Integrating Mindfulness into Daily Life',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '5',
    title: 'Digital Marketing Fundamentals',
    creator: {
      id: 'c5',
      name: 'David Kim',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 58,
    lessonCount: 5,
    category: 'Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Master the basics of digital marketing including social media, SEO, content marketing, and analytics.',
    lessons: [
      {
        id: 'l5-1',
        title: 'Digital Marketing Overview',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l5-2',
        title: 'Social Media Marketing Strategies',
        duration: 13,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l5-3',
        title: 'Search Engine Optimization',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l5-4',
        title: 'Content Marketing',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l5-5',
        title: 'Analytics and Performance Tracking',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '6',
    title: 'Startup Fundamentals',
    creator: {
      id: 'c6',
      name: 'Jessica Taylor',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 65,
    lessonCount: 6,
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Everything you need to know to start your own business, from ideation to launch and beyond.',
    lessons: [
      {
        id: 'l6-1',
        title: 'Identifying Business Opportunities',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l6-2',
        title: 'Market Research and Validation',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l6-3',
        title: 'Business Plan Development',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l6-4',
        title: 'Funding Strategies',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l6-5',
        title: 'Legal Considerations',
        duration: 9,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l6-6',
        title: 'Building Your Team',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '7',
    title: 'Personal Finance Essentials',
    creator: {
      id: 'c7',
      name: 'Robert Chen',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 50,
    lessonCount: 5,
    category: 'Personal Development',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Learn how to manage your personal finances, save effectively, invest wisely, and build long-term wealth.',
    lessons: [
      {
        id: 'l7-1',
        title: 'Budgeting Fundamentals',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l7-2',
        title: 'Debt Management Strategies',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l7-3',
        title: 'Saving and Emergency Funds',
        duration: 9,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l7-4',
        title: 'Introduction to Investing',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l7-5',
        title: 'Retirement Planning',
        duration: 8,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  },
  {
    id: '8',
    title: 'Public Speaking Mastery',
    creator: {
      id: 'c8',
      name: 'Olivia Parker',
      imageUrl: 'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    duration: 42,
    lessonCount: 4,
    category: 'Personal Development',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    description: 'Overcome your fear of public speaking and learn to deliver powerful presentations that engage and inspire your audience.',
    lessons: [
      {
        id: 'l8-1',
        title: 'Understanding Speech Anxiety',
        duration: 10,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'l8-2',
        title: 'Structuring Your Presentation',
        duration: 12,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l8-3',
        title: 'Body Language and Voice Modulation',
        duration: 11,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'l8-4',
        title: 'Engaging Your Audience',
        duration: 9,
        audioUrl: '/placeholder.mp3',
        isCompleted: false,
        isLocked: true
      }
    ]
  }
];

export const getPodcastById = (id: string): Podcast | undefined => {
  return podcasts.find(podcast => podcast.id === id);
};
