// Free public Quran recitation CDNs.
//
// alquran.cloud / islamic.network exposes:
//   - per-ayah:  https://cdn.islamic.network/quran/audio/{bitrate}/{reciter}/{globalAyah}.mp3
//   - per-surah: https://cdn.islamic.network/quran/audio-surah/{bitrate}/{reciter}/{surah}.mp3
// where globalAyah is the 1..6236 sequential number across the Quran.

const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
];

export interface Reciter {
  id: string;
  name: string;
}

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq al-Minshawi' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub' },
];

export const DEFAULT_RECITER = 'ar.alafasy';

export function isValidReciter(id: string): boolean {
  return RECITERS.some(r => r.id === id);
}

/** Returns the global ayah number (1..6236) for a (surah, ayah) pair, or null if invalid. */
export function globalAyahNumber(surahNumber: number, ayahNumberInSurah: number): number | null {
  if (surahNumber < 1 || surahNumber > 114) return null;
  const count = SURAH_AYAH_COUNTS[surahNumber - 1]!;
  if (ayahNumberInSurah < 1 || ayahNumberInSurah > count) return null;
  let global = 0;
  for (let i = 0; i < surahNumber - 1; i++) global += SURAH_AYAH_COUNTS[i]!;
  return global + ayahNumberInSurah;
}

export function ayahAudioUrl(
  surahNumber: number,
  ayahNumberInSurah: number,
  reciter: string = DEFAULT_RECITER,
  bitrate: 64 | 128 | 192 = 128,
): string | null {
  const g = globalAyahNumber(surahNumber, ayahNumberInSurah);
  if (g === null) return null;
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter}/${g}.mp3`;
}

export function surahAudioUrl(
  surahNumber: number,
  reciter: string = DEFAULT_RECITER,
  bitrate: 64 | 128 | 192 = 128,
): string | null {
  if (surahNumber < 1 || surahNumber > 114) return null;
  return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${reciter}/${surahNumber}.mp3`;
}
