import type { Collection, Filter } from 'mongodb';
import { getDb } from './client.js';

export interface RawAyah {
  number: number;
  arabic: string;
  translation: string;
}

export interface RawSurah {
  number: number;
  arabicName: string;
  englishName: string;
  transliteration: string;
  totalAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: RawAyah[];
}

const COLLECTION = 'surahs';

export async function surahsCollection(): Promise<Collection<RawSurah>> {
  const db = await getDb();
  return db.collection<RawSurah>(COLLECTION);
}

export async function listAllSurahs(): Promise<Omit<RawSurah, 'ayahs'>[]> {
  const col = await surahsCollection();
  const docs = await col
    .find({}, { projection: { ayahs: 0, _id: 0, __v: 0 } })
    .sort({ number: 1 })
    .toArray();
  return docs as unknown as Omit<RawSurah, 'ayahs'>[];
}

export async function getSurahByNumber(num: number): Promise<RawSurah | null> {
  const col = await surahsCollection();
  return col.findOne({ number: num }, { projection: { _id: 0, __v: 0 } as never });
}

export interface SearchHit {
  surahNumber: number;
  surahName: string;
  surahTransliteration: string;
  numberInSurah: number;
  arabic: string;
  translation: string;
}

export async function searchAyahs(query: string, limit = 30): Promise<SearchHit[]> {
  const col = await surahsCollection();
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(safe, 'i');

  const cursor = col.aggregate<SearchHit>([
    { $match: { 'ayahs.translation': regex } as Filter<RawSurah> },
    { $unwind: '$ayahs' },
    { $match: { 'ayahs.translation': regex } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        surahNumber: '$number',
        surahName: '$arabicName',
        surahTransliteration: '$transliteration',
        numberInSurah: '$ayahs.number',
        arabic: '$ayahs.arabic',
        translation: '$ayahs.translation',
      },
    },
  ]);

  return cursor.toArray();
}
