
import { Podcast } from '../../types';

export const uxPodcast: Podcast = {
  id: '2',
  title: 'UX Design Essentials',
  creator: {
    id: 'c2',
    name: 'Alex Chen',
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  },
  duration: 45,
  lessonCount: 4,
  category: {
    id: '6',
    nombre: 'Design'
  },
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
  ],
  modules: [
    {
      id: 'module-2-1',
      title: 'Conceptos Básicos',
      lessonIds: ['l2-1', 'l2-2']
    },
    {
      id: 'module-2-2',
      title: 'Técnicas Intermedias',
      lessonIds: ['l2-3', 'l2-4']
    }
  ]
};
