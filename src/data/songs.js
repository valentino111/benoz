export const songs = [
  {
    id: 'lihyot',
    domId: 'track-lihyot',
    title: 'לחיות',
    audio: 'assets/lachayot-remastered.mp3',
    cover: 'assets/cover-yofi.jpg',
    animation: 'assets/lachayot-hover.mp4',
    noteEn: 'A song about choosing to keep living, creating and searching for light even when reality fractures.',
    noteHe: 'שיר על הבחירה להמשיך לחיות, ליצור ולחפש אור גם כאשר המציאות נשברת.',
  },
  {
    id: 'yofi',
    domId: 'track-yofi',
    title: 'יופי הוא כוח עצום',
    audio: 'assets/yofi-hu-koach-atzum-remastered.mp3',
    cover: 'assets/cover-lachayot.jpg',
    animation: 'assets/yofi-hover.mp4',
    noteEn: 'A musical reflection on beauty as a force that softens the soul and changes the way we see.',
    noteHe: 'הרהור מוזיקלי על יופי ככוח שמרכך את הנשמה ומשנה את האופן שבו אנו רואים.',
  },
];

export const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
