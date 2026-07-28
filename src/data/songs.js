export const songs = [
  {
    id: 'lihyot',
    order: 10,
    titleEn: 'Lihyot',
    titleHe: 'לחיות',
    artist: 'Ben Oz',
    audio: '/assets/lachayot-remastered.mp3',
    cover: '/assets/cover-yofi.jpg',
    video: '/assets/lachayot-hover.mp4',
    noteEn: 'A song about choosing to keep living, creating and searching for light even when reality fractures.',
    noteHe: 'שיר על הבחירה להמשיך לחיות, ליצור ולחפש אור גם כאשר המציאות נשברת.',
    relatedWorkIds: ['hidden-harmony', 'to-live'],
  },
  {
    id: 'yofi',
    order: 20,
    titleEn: 'Yofi Hu Koach Atzum',
    titleHe: 'יופי הוא כוח עצום',
    artist: 'Ben Oz',
    audio: '/assets/yofi-hu-koach-atzum-remastered.mp3',
    cover: '/assets/cover-lachayot.jpg',
    video: '/assets/yofi-hover.mp4',
    noteEn: 'A musical reflection on beauty as a force that softens the soul and changes the way we see.',
    noteHe: 'הרהור מוזיקלי על יופי ככוח שמרכך את הנשמה ומשנה את האופן שבו אנו רואים.',
    relatedWorkIds: ['inner-light', 'beauty-as-power', 'the-light-within-pearl'],
  },
];

export const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
