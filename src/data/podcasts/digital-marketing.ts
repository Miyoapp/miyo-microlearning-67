
import { Podcast } from '../../types';

export const marketingPodcast: Podcast = {
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
  ],
  modules: [
    {
      id: 'module-5-1',
      title: 'Conceptos Básicos',
      lessonIds: ['l5-1', 'l5-2']
    },
    {
      id: 'module-5-2',
      title: 'Técnicas Intermedias',
      lessonIds: ['l5-3', 'l5-4']
    },
    {
      id: 'module-5-3',
      title: 'Aplicación Práctica',
      lessonIds: ['l5-5']
    }
  ]
};
