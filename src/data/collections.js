import { exhibitionWorks } from '../collections/exhibition/works.js';
import { pearlsOfTruthWorks } from '../collections/pearls-of-truth/works.js';

export const collections = [
  {
    id: 'exhibition',
    number: '01',
    title: 'Exhibition',
    titleHe: 'קולות העוטף',
    type: 'Visual Collection',
    description: 'Visual works and their stories.',
    cover: '/assets/hidden-harmony.jpg',
    target: 'gallery',
    works: exhibitionWorks,
  },
  {
    id: 'pearls-of-truth',
    number: '02',
    title: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    type: 'Poetry · Art · Music',
    description: 'A collection where words, images, music and motion meet.',
    cover: '/assets/cover-lachayot.jpg',
    target: 'music',
    works: pearlsOfTruthWorks,
  },
];
