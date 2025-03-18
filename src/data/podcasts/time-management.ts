
import { Podcast } from '../../types';

export const timePodcast: Podcast = {
  id: '1',
  title: 'Mastering Time Management',
  creator: {
    id: 'c1',
    name: 'Emma Wilson',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  },
  duration: 62, // 62 minutes total
  lessonCount: 5,
  category: {
    id: '1',
    nombre: 'Productivity'
  },
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
  ],
  modules: [
    {
      id: 'module-1-1',
      title: 'Conceptos Básicos',
      lessonIds: ['l1-1', 'l1-2']
    },
    {
      id: 'module-1-2',
      title: 'Técnicas Intermedias',
      lessonIds: ['l1-3', 'l1-4']
    },
    {
      id: 'module-1-3',
      title: 'Aplicación Práctica',
      lessonIds: ['l1-5']
    }
  ]
};
