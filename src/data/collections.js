import { exhibitionWorks } from '../collections/exhibition/works.js';
import { pearlsOfTruthWorks } from '../collections/pearls-of-truth/works.js';

export const collections = [
  {
    id: 'exhibition',
    enabled: true,
    order: 10,
    number: '01',
    title: 'Exhibition',
    titleHe: 'קולות העוטף',
    type: 'Visual Collection',
    subtitleEn: 'The Hidden Geometry\nof the Soul',
    subtitleHe: 'הגאומטריה הנסתרת של הנפש',
    description: 'Ideas become Poetry\nPoetry becomes Art\nArt becomes Music\nMusic becomes Cinema\nCinema becomes Memory',
    descriptionHe: 'רעיונות הופכים לשירה\nשירה הופכת לאמנות\nאמנות הופכת למוזיקה\nמוזיקה הופכת לקולנוע\nקולנוע הופך לזיכרון',
    noteEn: 'The complete series consists of six works.\nFour are presented in the current exhibition.\nEach artwork is available in its original artistic version with integrated text, where typography is an essential part of the composition, or as a clean image without text, according to the collector’s preference.',
    noteHe: 'הסדרה המלאה כוללת שש עבודות.\nארבע מתוכן משתתפות בתערוכה הנוכחית.\nכל יצירה זמינה בגרסתה האמנותית המקורית, שבה הטקסט מהווה חלק בלתי נפרד מהקומפוזיציה, או בגרסה נקייה ללא טקסט – בהתאם להעדפת האספן.',
    cover: '/assets/hidden-harmony.jpg',
    pageId: 'gallery',
    works: exhibitionWorks,
  },
  {
    id: 'pearls-of-truth',
    enabled: true,
    order: 20,
    number: '02',
    title: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    type: 'Poetry · Art · Music',
    description: 'A collection where words, images, music and motion meet.',
    cover: '/assets/cover-lachayot.jpg',
    pageId: 'collection-pearls-of-truth',
    works: pearlsOfTruthWorks,
  },
];
