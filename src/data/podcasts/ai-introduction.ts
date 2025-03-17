
import { Podcast } from '../../types';

export const aiPodcast: Podcast = {
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
  ],
  modules: [
    {
      id: 'module-3-1',
      title: 'Conceptos Básicos',
      lessonIds: ['l3-1', 'l3-2']
    },
    {
      id: 'module-3-2',
      title: 'Técnicas Intermedias',
      lessonIds: ['l3-3', 'l3-4']
    },
    {
      id: 'module-3-3',
      title: 'Aplicación Práctica',
      lessonIds: ['l3-5']
    }
  ]
};
