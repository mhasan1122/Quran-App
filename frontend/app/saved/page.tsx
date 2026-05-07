'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import IconSidebar from '../components/IconSidebar';
import { CollectionFolder, useCollections } from '../context/CollectionsContext';

export default function SavedPage() {
  const router = useRouter();
  const { getFolders, getItemsByFolder, clearFolder } = useCollections();
  const folders = useMemo(() => getFolders('bookmark'), [getFolders]);
  const [activeFolderId, setActiveFolderId] = useState<string>(folders[0]?.id ?? 'favorites');

  useEffect(() => {
    if (folders.length && !folders.some(f => f.id === activeFolderId)) setActiveFolderId(folders[0].id);
  }, [folders, activeFolderId]);

  const items = getItemsByFolder(activeFolderId);
  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <IconSidebar
        activePanel="bookmark"
        onPanelChange={(panel) => {
          if (panel === 'surah') router.push('/');
          if (panel === 'bookmark') return;
        }}
      />

      {/* Left: folder list */}
      <div style={{ width: 320, minWidth: 320, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', height: '100%', overflow: 'hidden' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Saved</div>
        </div>
        <div style={{ padding: 12, overflow: 'auto', height: 'calc(100% - 56px)' }}>
          {folders.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              count={getItemsByFolder(f.id).length}
              active={f.id === activeFolderId}
              onClick={() => setActiveFolderId(f.id)}
            />
          ))}
        </div>
      </div>

      {/* Middle: list */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="top-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
            {activeFolder?.name ?? 'Favorites'} <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginLeft: 8 }}>Total Ayah: {items.length}</span>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => clearFolder(activeFolderId)}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '8px 12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Clear folder
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>No saved ayahs in this folder.</div>
          ) : (
            items.map((i) => (
              <div key={i.key} className="ayah-card">
                <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 800, marginBottom: 10 }}>
                  {i.surahNumber}:{i.ayahNumberInSurah}
                </div>
                <div style={{ direction: 'rtl', textAlign: 'right', color: 'var(--text-primary)', fontSize: 22, lineHeight: 2.1, marginBottom: 10 }}>
                  {i.arabicText}
                </div>
                <div style={{ color: 'var(--accent-on-primary)', fontSize: 15, lineHeight: 1.7, fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
                  {i.translation}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FolderCard({ folder, count, active, onClick }: { folder: CollectionFolder; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: active ? 'rgba(65,127,56,0.10)' : 'rgba(255,255,255,0.02)',
        border: active ? '1px solid rgba(65,127,56,0.55)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 14,
        cursor: 'pointer',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        marginBottom: 10,
      }}
    >
      <span aria-hidden style={{ width: 18, height: 18, borderRadius: 5, background: folder.color, opacity: 0.92 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 900 }}>{folder.name}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Total Ayah: {count}</div>
      </div>
    </button>
  );
}

