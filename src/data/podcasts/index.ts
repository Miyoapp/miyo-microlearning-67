
import { Podcast, Category } from '../../types';
import { timePodcast } from './time-management';
import { uxPodcast } from './ux-design';
import { aiPodcast } from './ai-introduction';
import { mindfulnessPodcast } from './mindfulness';
import { marketingPodcast } from './digital-marketing';
import { startupPodcast } from './startup';
import { financePodcast } from './personal-finance';
import { speakingPodcast } from './public-speaking';

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
