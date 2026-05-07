export interface Ayah {
  numberInSurah: number;
  text: string; // Arabic text
  translation: string;
  audio: string | null; // direct mp3 URL for this ayah
}

export interface SurahSummary {
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface SurahData extends SurahSummary {
  audio: string | null; // full-surah mp3 URL
  reciter: string;
  ayahs: Ayah[];
}

export interface SearchResultItem {
  surahNumber: number;
  surahName: string;       // transliterated, e.g. "Al-Baqarah"
  surahArabicName: string; // Arabic name
  surahMeaning: string;    // English translation, e.g. "The Cow"
  numberInSurah: number;
  text: string;            // matching English translation
  arabic: string;          // Arabic text of the ayah
}

export interface Reciter {
  id: string;
  name: string;
}

const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000';

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json()).error || '';
    } catch {}
    throw new Error(`API ${path} failed: ${res.status} ${detail}`.trim());
  }
  return res.json() as Promise<T>;
}

export function fetchAllSurahs(): Promise<SurahSummary[]> {
  return getJson<SurahSummary[]>('/api/surahs');
}

export function fetchSurah(
  surahNumber: number,
  reciter?: string,
): Promise<SurahData> {
  const qs = reciter ? `?reciter=${encodeURIComponent(reciter)}` : '';
  return getJson<SurahData>(`/api/surahs/${surahNumber}${qs}`);
}

export async function searchAyahs(query: string, limit = 30): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const data = await getJson<{ total: number; results: SearchResultItem[] }>(
    `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
  return data.results;
}

export function fetchReciters(): Promise<{ default: string; reciters: Reciter[] }> {
  return getJson('/api/audio/reciters');
}

export function ayahAudioUrl(
  surahNumber: number,
  ayahNumberInSurah: number,
  reciter?: string,
): Promise<{ url: string; reciter: string }> {
  const qs = reciter ? `?reciter=${encodeURIComponent(reciter)}` : '';
  return getJson(`/api/audio/ayah/${surahNumber}/${ayahNumberInSurah}${qs}`);
}

export function surahAudioUrl(
  surahNumber: number,
  reciter?: string,
): Promise<{ url: string; reciter: string }> {
  const qs = reciter ? `?reciter=${encodeURIComponent(reciter)}` : '';
  return getJson(`/api/audio/surah/${surahNumber}${qs}`);
}
