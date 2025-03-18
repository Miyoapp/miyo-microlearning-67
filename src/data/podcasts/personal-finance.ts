
import { Podcast } from '../../types';

export const financePodcast: Podcast = {
  id: '7',
  title: 'Personal Finance Essentials',
  creator: {
    id: 'c7',
    name: 'Robert Chen',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
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
  ]
};
