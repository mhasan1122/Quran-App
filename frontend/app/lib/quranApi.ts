export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string; // Arabic text
  translation: string;
  juz: number;
  page: number;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

const API_BASE = 'https://api.alquran.cloud/v1';

export async function fetchSurah(surahNumber: number): Promise<SurahData> {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${API_BASE}/surah/${surahNumber}`),
    fetch(`${API_BASE}/surah/${surahNumber}/en.sahih`),
  ]);

  const [arabicData, translationData] = await Promise.all([
    arabicRes.json(),
    translationRes.json(),
  ]);

  const arabic = arabicData.data;
  const translation = translationData.data;

  const ayahs: Ayah[] = arabic.ayahs.map((a: any, i: number) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    text: a.text,
    translation: translation.ayahs[i]?.text || '',
    juz: a.juz,
    page: a.page,
  }));

  return {
    number: arabic.number,
    name: arabic.name,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    numberOfAyahs: arabic.numberOfAyahs,
    revelationType: arabic.revelationType,
    ayahs,
  };
}

export async function searchAyahs(query: string, surahNumber?: number): Promise<Array<{ ayah: Ayah; surahNumber: number; surahName: string }>> {
  if (!query.trim()) return [];
  const url = surahNumber
    ? `${API_BASE}/search/${encodeURIComponent(query)}/all/en.sahih`
    : `${API_BASE}/search/${encodeURIComponent(query)}/all/en.sahih`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.data?.matches) return [];

  return data.data.matches.slice(0, 50).map((m: any) => ({
    ayah: {
      number: m.number,
      numberInSurah: m.numberInSurah,
      text: m.text || '',
      translation: m.text || '',
      juz: m.juz,
      page: m.page,
    },
    surahNumber: m.surah?.number || 0,
    surahName: m.surah?.englishName || '',
  }));
}
