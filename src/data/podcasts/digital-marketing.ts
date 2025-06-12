
import { Podcast } from '../../types';

export const marketingPodcast: Podcast = {
  id: '5',
  title: 'Digital Marketing Fundamentals',
  creator: {
    id: 'c5',
    name: 'David Kim',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    linkedinUrl: null
  },
  duration: 58,
  lessonCount: 5,
  category: {
    id: '7',
    nombre: 'Marketing'
  },
  imageUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  description: 'Master the basics of digital marketing including social media, SEO, content marketing, and analytics.',
  lessons: [
    {
      id: 'l5-1',
      title: 'Digital Marketing Overview',
      duracion: 12,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: false,
      description: null,
      orden: 1
    },
    {
      id: 'l5-2',
      title: 'Social Media Marketing Strategies',
      duracion: 13,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 2
    },
    {
      id: 'l5-3',
      title: 'Search Engine Optimization',
      duracion: 11,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 3
    },
    {
      id: 'l5-4',
      title: 'Content Marketing',
      duracion: 10,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 4
    },
    {
      id: 'l5-5',
      title: 'Analytics and Performance Tracking',
      duracion: 12,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 5
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
  ],
  tipo_curso: 'libre',
  likes: 0,
  dislikes: 0
};
