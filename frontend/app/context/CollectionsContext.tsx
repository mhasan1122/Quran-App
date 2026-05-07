'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CollectionType = 'bookmark' | 'pin';

export type CollectionFolder = {
  id: string;
  name: string;
  color: string; // hex
  type: CollectionType;
  createdAt: number;
};

export type CollectionItem = {
  key: string; // `${type}:${folderId}:${surahNumber}:${ayahNumberInSurah}`
  type: CollectionType;
  folderId: string;
  surahNumber: number;
  ayahNumberInSurah: number;
  arabicText: string;
  translation: string;
  savedAt: number;
};

type CollectionsState = {
  folders: CollectionFolder[];
  items: CollectionItem[];
};

type CollectionsContextType = {
  folders: CollectionFolder[];
  items: CollectionItem[];
  getFolders: (type: CollectionType) => CollectionFolder[];
  getItemsByFolder: (folderId: string) => CollectionItem[];
  isInFolder: (folderId: string, surahNumber: number, ayahNumberInSurah: number) => boolean;
  addToFolder: (input: Omit<CollectionItem, 'key' | 'savedAt'>) => void;
  removeFromFolder: (folderId: string, surahNumber: number, ayahNumberInSurah: number) => void;
  createFolder: (input: Omit<CollectionFolder, 'id' | 'createdAt'>) => CollectionFolder;
  clearFolder: (folderId: string) => void;
};

const CollectionsContext = createContext<CollectionsContextType>({
  folders: [],
  items: [],
  getFolders: () => [],
  getItemsByFolder: () => [],
  isInFolder: () => false,
  addToFolder: () => {},
  removeFromFolder: () => {},
  createFolder: () => ({ id: '', name: '', color: '#5DBB63', type: 'bookmark', createdAt: 0 }),
  clearFolder: () => {},
});

const STORAGE_KEY = 'qm-collections-v1';
const LEGACY_BOOKMARKS_KEY = 'qm-bookmarks';

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function defaultFolders(): CollectionFolder[] {
  return [
    { id: 'favorites', name: 'Favorites', color: '#5DBB63', type: 'bookmark', createdAt: Date.now() },
  ];
}

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CollectionsState>({ folders: defaultFolders(), items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CollectionsState;
        if (parsed?.folders?.length) {
          setState({
            folders: Array.isArray(parsed.folders) ? parsed.folders : defaultFolders(),
            items: Array.isArray(parsed.items) ? parsed.items : [],
          });
          return;
        }
      }

      // Migrate legacy bookmarks into Favorites folder (bookmark type).
      const legacyRaw = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (Array.isArray(legacy) && legacy.length > 0) {
          const migratedItems: CollectionItem[] = legacy.map((b: any) => {
            const surahNumber = Number(b.surahNumber);
            const ayahNumberInSurah = Number(b.ayahNumberInSurah);
            const key = `bookmark:favorites:${surahNumber}:${ayahNumberInSurah}`;
            return {
              key,
              type: 'bookmark',
              folderId: 'favorites',
              surahNumber,
              ayahNumberInSurah,
              arabicText: String(b.arabicText ?? ''),
              translation: String(b.translation ?? ''),
              savedAt: Number(b.savedAt ?? Date.now()),
            };
          });
          const next = { folders: defaultFolders(), items: migratedItems };
          setState(next);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: CollectionsState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const getFolders = (type: CollectionType) => state.folders.filter(f => f.type === type);

  const getItemsByFolder = (folderId: string) =>
    state.items
      .filter(i => i.folderId === folderId)
      .sort((a, b) => b.savedAt - a.savedAt);

  const isInFolder = (folderId: string, surahNumber: number, ayahNumberInSurah: number) =>
    state.items.some(i => i.folderId === folderId && i.surahNumber === surahNumber && i.ayahNumberInSurah === ayahNumberInSurah);

  const addToFolder: CollectionsContextType['addToFolder'] = (input) => {
    const key = `${input.type}:${input.folderId}:${input.surahNumber}:${input.ayahNumberInSurah}`;
    if (state.items.some(i => i.key === key)) return;
    const nextItem: CollectionItem = { ...input, key, savedAt: Date.now() };
    persist({ ...state, items: [nextItem, ...state.items] });
  };

  const removeFromFolder = (folderId: string, surahNumber: number, ayahNumberInSurah: number) => {
    persist({ ...state, items: state.items.filter(i => !(i.folderId === folderId && i.surahNumber === surahNumber && i.ayahNumberInSurah === ayahNumberInSurah)) });
  };

  const createFolder: CollectionsContextType['createFolder'] = (input) => {
    const folder: CollectionFolder = { ...input, id: uid('folder'), createdAt: Date.now() };
    persist({ ...state, folders: [folder, ...state.folders] });
    return folder;
  };

  const clearFolder = (folderId: string) => {
    persist({ ...state, items: state.items.filter(i => i.folderId !== folderId) });
  };

  const value = useMemo(
    () => ({
      folders: state.folders,
      items: state.items,
      getFolders,
      getItemsByFolder,
      isInFolder,
      addToFolder,
      removeFromFolder,
      createFolder,
      clearFolder,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export const useCollections = () => useContext(CollectionsContext);

