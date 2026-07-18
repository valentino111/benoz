// Foundation data for Pearls of Truth. A song is referenced by id, so the
// same musical interpretation can accompany several separate works.
export const pearlsOfTruthWorks = [
  {
    id: 'beauty-as-power',
    collectionId: 'pearls-of-truth',
    titleEn: 'Beauty Is a Mighty Force',
    titleHe: 'יופי הוא כוח עצום',
    image: 'assets/cover-lachayot.jpg',
    textEn: 'A reflection on beauty as a force that softens the soul and changes the way we see.',
    textHe: 'הרהור על יופי ככוח שמרכך את הנשמה ומשנה את האופן שבו אנו רואים.',
    media: {
      image: 'assets/cover-lachayot.jpg',
      animation: 'assets/yofi-hover.mp4',
      songIds: ['yofi'],
    },
  },
  {
    id: 'the-light-within-pearl',
    collectionId: 'pearls-of-truth',
    titleEn: 'The Light Within',
    titleHe: 'האור שבפנים',
    image: 'assets/inner-light.jpg',
    textEn: 'The light we seek outside may already be alive within us.',
    textHe: 'ייתכן שהאור שאנו מחפשים בחוץ כבר חי בתוכנו.',
    media: {
      image: 'assets/inner-light.jpg',
      animation: null,
      songIds: ['yofi'],
    },
  },
  {
    id: 'to-live',
    collectionId: 'pearls-of-truth',
    titleEn: 'To Live',
    titleHe: 'לחיות',
    image: 'assets/cover-yofi.jpg',
    textEn: 'A choice to keep living, creating and searching for light when reality fractures.',
    textHe: 'בחירה להמשיך לחיות, ליצור ולחפש אור גם כשהמציאות נשברת.',
    media: {
      image: 'assets/cover-yofi.jpg',
      animation: 'assets/lachayot-hover.mp4',
      songIds: ['lihyot'],
    },
  },
];
