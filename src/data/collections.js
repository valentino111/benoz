import { exhibitionWorks } from '../collections/exhibition/works.js';
import { pearlsOfTruthWorks } from '../collections/pearls-of-truth/works.js';

export const collections = [
  {
    id: 'exhibition',
    enabled: true,
    sort: 10,
    titleEn: 'Exhibition',
    titleHe: 'קולות העוטף',
    type: 'Visual Collection',
    subtitleEn: 'The Hidden Geometry\nof the Soul',
    subtitleHe: 'הגאומטריה הנסתרת של הנפש',
    descriptionEn: 'Ideas become Poetry\nPoetry becomes Art\nArt becomes Music\nMusic becomes Cinema\nCinema becomes Memory',
    descriptionHe: 'רעיונות הופכים לשירה\nשירה הופכת לאמנות\nאמנות הופכת למוזיקה\nמוזיקה הופכת לקולנוע\nקולנוע הופך לזיכרון',
    noteEn: 'The complete series consists of six works.\nFour are presented in the current exhibition.',
    noteHe: 'הסדרה המלאה כוללת שש עבודות.\nארבע מתוכן משתתפות בתערוכה הנוכחית.',
    posterImage: '/assets/hidden-harmony.jpg',
    posterVideo: '/assets/ExhibitionCoverAnimation.MP4',
    pageId: 'gallery',
    works: exhibitionWorks,
  },
  {
    id: 'pearls-of-truth',
    enabled: true,
    sort: 20,
    titleEn: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    type: 'Poetry · Art · Music',
    descriptionEn: 'A collection where words, images, music and motion meet.',
    noteEn: '',
    noteHe: '',
    posterImage: '/assets/cover-lachayot.jpg',
    posterVideo: '/assets/PearlsOfTruthAnimation.MP4',
    pageId: 'collection-pearls-of-truth',
    works: pearlsOfTruthWorks,
  },
];
