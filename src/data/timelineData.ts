import { SongTimeline } from '../types';

export const DRACULA_TIMELINE: SongTimeline = {
  id: 'dracula',
  title: 'Dracula',
  artist: 'Tame Impala',
  audioSrc: './audio/dracula.mp3',
  audioStartOffset: 18.0, // 0:18 timestamp
  audioEndOffset: 62.0,   // 01:02 timestamp
  duration: 44.0,         // Exact segment duration (62.0 - 18.0)
  frameCount: 300,
  framePrefix: 'ezgif-frame-',
  framePath: './frames/dracula',
  beats: [
    {
      id: 'd_night',
      name: 'NIGHT / OPENING',
      startTime: 0.0,
      endTime: 6.6, // 15% of 44.0s
      startProgress: 0.0,
      endProgress: 0.15,
      frameStart: 1,
      frameEnd: 45,
      description: '0–15% — NIGHT / OPENING: Very slow, atmospheric movement. Dreamlike paper diorama.',
      intensity: 0.3,
      specialEffect: 'drift'
    },
    {
      id: 'd_sunrise',
      name: 'SUNRISE',
      startTime: 6.6,
      endTime: 13.2, // 30% of 44.0s
      startProgress: 0.15,
      endProgress: 0.30,
      frameStart: 46,
      frameEnd: 125,
      description: '15–30% — SUNRISE: Noticeably faster progression (~12 FPS). Paper sun rises as morning light turns blue.',
      intensity: 0.6,
      specialEffect: 'sunrise'
    },
    {
      id: 'd_day',
      name: 'DAY',
      startTime: 13.2,
      endTime: 22.0, // 50% of 44.0s
      startProgress: 0.30,
      endProgress: 0.50,
      frameStart: 126,
      frameEnd: 215,
      description: '30–50% — DAY: Continuous natural movement (~10 FPS). Scene feels alive with sun and waves.',
      intensity: 0.75,
      specialEffect: 'daylight'
    },
    {
      id: 'd_sunset',
      name: 'SUNSET',
      startTime: 22.0,
      endTime: 28.6, // 65% of 44.0s
      startProgress: 0.50,
      endProgress: 0.65,
      frameStart: 216,
      frameEnd: 245,
      description: '50–65% — SUNSET: Smooth cinematic movement into twilight. Daylight makes me feel like Dracula.',
      intensity: 0.7,
      specialEffect: 'sunset'
    },
    {
      id: 'd_moonrise',
      name: 'MOONRISE',
      startTime: 28.6,
      endTime: 34.3, // 78% of 44.0s
      startProgress: 0.65,
      endProgress: 0.78,
      frameStart: 246,
      frameEnd: 265,
      description: '65–78% — MOONRISE: Atmospheric beat. Paper moon emerges gradually and elegantly.',
      intensity: 0.65,
      specialEffect: 'moonrise'
    },
    {
      id: 'd_moon_man',
      name: 'MAN IN THE MOON',
      startTime: 34.3,
      endTime: 38.7, // 88% of 44.0s
      startProgress: 0.78,
      endProgress: 0.88,
      frameStart: 266,
      frameEnd: 285,
      description: '78–88% — MAN IN THE MOON: Deliberate, readable character acting. Looks left, right, turns to viewer.',
      intensity: 0.8,
      specialEffect: 'man_in_moon'
    },
    {
      id: 'd_glitch',
      name: 'GLITCH / COLLAPSE',
      startTime: 38.7,
      endTime: 43.0,
      startProgress: 0.88,
      endProgress: 43.0 / 44.0,
      frameStart: 286,
      frameEnd: 300,
      description: '88–100% — GLITCH / COLLAPSE: Rapidly accelerating progression, stutter, frame skipping, chromatic offset.',
      intensity: 1.0,
      specialEffect: 'collapse'
    },
    {
      id: 'd_black',
      name: 'BLACK',
      startTime: 43.0,
      endTime: 44.0,
      startProgress: 43.0 / 44.0,
      endProgress: 1.0,
      frameStart: 300,
      frameEnd: 300,
      description: 'Complete blackout held before the glitch noise transition.',
      intensity: 0.0,
      specialEffect: 'collapse'
    }
  ],
  lyrics: [
    { time: 10.5, text: 'The morning light is turning blue, the feeling is bizarre', subtext: '(Bizarre)', glitchLevel: 0 },
    { time: 14.8, text: "The night is almost over, I still don't know where you are", glitchLevel: 0 },
    { time: 19.0, text: 'The shadows, yeah, they keep me pretty like a movie star', glitchLevel: 0 },
    { time: 23.1, text: 'Daylight makes me feel like Dracula', subtext: '(Dracula)', glitchLevel: 0 },
    { time: 28.2, text: "In the end, I hope it's you and me", subtext: 'In the end...', glitchLevel: 1 },
    { time: 32.4, text: 'In the darkness, I would never leave you', subtext: '(Ah)', glitchLevel: 1 },
    { time: 36.2, text: "You won't ever see me in the light of day", glitchLevel: 2 },
    { time: 39.8, text: "It's far too late, the time has come", glitchLevel: 2 },
    { time: 43.0, text: '(glitching noise / collapse into black)', glitchLevel: 2 }
  ]
};

export const AISHITE_TIMELINE: SongTimeline = {
  id: 'aishite',
  title: '愛して愛して愛して',
  artist: 'Kikuo',
  audioSrc: './audio/aishite.mp3',
  audioStartOffset: 182.0, // 03:02 timestamp
  audioEndOffset: 208.0,   // 03:28 timestamp
  duration: 26.0,          // Exact segment duration (208.0 - 182.0)
  frameCount: 50,
  framePrefix: 'ezgif-frame-',
  framePath: './frames/aishite',
  beats: [
    {
      id: 'a_awakening',
      name: 'AWAKENING',
      startTime: 0.0,
      endTime: 3.5,
      startProgress: 0.0,
      endProgress: 3.5 / 26.0,
      frameStart: 1,
      frameEnd: 7,
      description: 'Atmospheric: single pink point of light expands, curtains part, doll awakens.',
      intensity: 0.35,
      specialEffect: 'spark'
    },
    {
      id: 'a_ribbons',
      name: 'RIBBONS & CAMELLIAS',
      startTime: 3.5,
      endTime: 8.5,
      startProgress: 3.5 / 26.0,
      endProgress: 8.5 / 26.0,
      frameStart: 8,
      frameEnd: 17,
      description: 'Swirling camellia petals, silk ribbons, her eyes track your cursor.',
      intensity: 0.55,
      specialEffect: 'ribbons'
    },
    {
      id: 'a_mirror',
      name: 'CURSED MIRROR',
      startTime: 8.5,
      endTime: 14.5,
      startProgress: 8.5 / 26.0,
      endProgress: 14.5 / 26.0,
      frameStart: 18,
      frameEnd: 28,
      description: 'Her reflection behaves subtly wrong, lagging and holding independent gaze.',
      intensity: 0.75,
      specialEffect: 'mirror'
    },
    {
      id: 'a_multiplicity',
      name: 'MULTIPLICITY',
      startTime: 14.5,
      endTime: 19.5,
      startProgress: 14.5 / 26.0,
      endProgress: 19.5 / 26.0,
      frameStart: 29,
      frameEnd: 38,
      description: 'Progressive acceleration: copies multiply into the darkness with shifting expressions.',
      intensity: 0.85,
      specialEffect: 'duplicates'
    },
    {
      id: 'a_climax',
      name: 'OBSESSIVE CLIMAX',
      startTime: 19.5,
      endTime: 23.5,
      startProgress: 19.5 / 26.0,
      endProgress: 23.5 / 26.0,
      frameStart: 39,
      frameEnd: 47,
      description: 'FAST! Rapid 12–15 FPS cycling, color pulses black/crimson/magenta, sudden silence.',
      intensity: 1.0,
      specialEffect: 'climax'
    },
    {
      id: 'a_ending_void',
      name: 'THE FINAL GAZE',
      startTime: 23.5,
      endTime: 25.0,
      startProgress: 23.5 / 26.0,
      endProgress: 25.0 / 26.0,
      frameStart: 48,
      frameEnd: 50,
      description: 'Only glowing purple eyes remain. A subtle smile, a slow blink, and fade to black.',
      intensity: 0.3,
      specialEffect: 'void_eyes'
    },
    {
      id: 'a_blackout',
      name: 'BLACKOUT',
      startTime: 25.0,
      endTime: 26.0,
      startProgress: 25.0 / 26.0,
      endProgress: 1.0,
      frameStart: 50,
      frameEnd: 50,
      description: 'Final blackness before resetting back to initial Play screen.',
      intensity: 0.0,
      specialEffect: 'void_eyes'
    }
  ],
  lyrics: [
    { time: 1.0, text: '愛して', subtext: 'Love me', glitchLevel: 0 },
    { time: 4.5, text: 'もっともっと', subtext: 'More and more', glitchLevel: 0 },
    { time: 8.5, text: '愛して 愛して 愛して', subtext: 'Love me, love me, love me', glitchLevel: 1 },
    { time: 14.0, text: '狂おしいほどに', subtext: 'To the point of madness', glitchLevel: 1 },
    { time: 18.0, text: '苦しい', subtext: 'It suffocates me', glitchLevel: 1 },
    { time: 21.0, text: '離さない', subtext: "I'll never let you go", glitchLevel: 2 },
    { time: 23.5, text: '幸せなの', subtext: "I am truly happy...", glitchLevel: 2 }
  ]
};

export const FLOATING_KANJI_STRINGS = [
  { text: '愛して', translation: 'Love me' },
  { text: '愛して 愛して 愛して', translation: 'Love me, love me, love me' },
  { text: 'もっともっと', translation: 'More, more' },
  { text: '狂おしいほどに', translation: 'To madness' },
  { text: '苦しい', translation: 'It hurts' },
  { text: '離さない', translation: 'Never let go' },
  { text: '幸せなの', translation: 'So happy' }
];
