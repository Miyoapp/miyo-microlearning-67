
import { Podcast } from '../../types';

export const financePodcast: Podcast = {
  id: '7',
  title: 'Personal Finance Essentials',
  creator: {
    id: 'c7',
    name: 'Robert Chen',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    linkedinUrl: null
  },
  duration: 50,
  lessonCount: 5,
  category: {
    id: '4',
    nombre: 'Personal Development'
  },
  imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  description: 'Learn how to manage your personal finances, save effectively, invest wisely, and build long-term wealth.',
  lessons: [
    {
      id: 'l7-1',
      title: 'Budgeting Fundamentals',
      duracion: 10,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: false,
      description: null,
      orden: 1
    },
    {
      id: 'l7-2',
      title: 'Debt Management Strategies',
      duracion: 11,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 2
    },
    {
      id: 'l7-3',
      title: 'Saving and Emergency Funds',
      duracion: 9,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 3
    },
    {
      id: 'l7-4',
      title: 'Introduction to Investing',
      duracion: 12,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 4
    },
    {
      id: 'l7-5',
      title: 'Retirement Planning',
      duracion: 8,
      urlAudio: '/placeholder.mp3',
      isCompleted: false,
      isLocked: true,
      description: null,
      orden: 5
    }
  ],
  modules: [
    {
      id: 'module-7-1',
      title: 'Fundamentos Financieros',
      lessonIds: ['l7-1', 'l7-2']
    },
    {
      id: 'module-7-2',
      title: 'Ahorro e Inversión',
      lessonIds: ['l7-3', 'l7-4']
    },
    {
      id: 'module-7-3',
      title: 'Planificación a Largo Plazo',
      lessonIds: ['l7-5']
    }
  ],
  tipo_curso: 'libre',
  likes: 0,
  dislikes: 0
};
