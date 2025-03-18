
import { Podcast, CategoryModel } from '../../types';
import { timePodcast } from './time-management';
import { uxPodcast } from './ux-design';
import { aiPodcast } from './ai-introduction';
import { mindfulnessPodcast } from './mindfulness';
import { marketingPodcast } from './digital-marketing';
import { startupPodcast } from './startup';
import { financePodcast } from './personal-finance';
import { speakingPodcast } from './public-speaking';

// This is kept for compatibility with the sample data
// In the real app, categories will come from the database
export const categories: CategoryModel[] = [
  { id: '1', nombre: 'Productivity' },
  { id: '2', nombre: 'Business' },
  { id: '3', nombre: 'Technology' },
  { id: '4', nombre: 'Personal Development' },
  { id: '5', nombre: 'Health' },
  { id: '6', nombre: 'Design' },
  { id: '7', nombre: 'Marketing' }
];

export const podcasts: Podcast[] = [
  timePodcast,
  uxPodcast,
  aiPodcast,
  mindfulnessPodcast,
  marketingPodcast,
  startupPodcast,
  financePodcast,
  speakingPodcast
];

export const getPodcastById = (id: string): Podcast | undefined => {
  return podcasts.find(podcast => podcast.id === id);
};
