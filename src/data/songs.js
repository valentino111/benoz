export const songs = [
  {
    id: 'lihyot',
    order: 10,
    titleEn: 'Lihyot',
    titleHe: 'לחיות',
    audio: '/assets/lachayot-remastered.mp3',
  },
  {
    id: 'yofi',
    order: 20,
    titleEn: 'Yofi Hu Koach Atzum',
    titleHe: 'יופי הוא כוח עצום',
    audio: '/assets/yofi-hu-koach-atzum-remastered.mp3',
  },
];

export const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
