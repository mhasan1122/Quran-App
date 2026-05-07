'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Compass, Bookmark, Settings } from 'lucide-react';
import { CollectionFolder, useCollections } from '../context/CollectionsContext';

export default function SavedPage() {
  const router = useRouter();
  const { getFolders, getItemsByFolder, clearFolder } = useCollections();
  const folders = useMemo(() => getFolders('bookmark'), [getFolders]);
  const [activeFolderId, setActiveFolderId] = useState<string>(folders[0]?.id ?? 'favorites');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (folders.length && !folders.some(f => f.id === activeFolderId)) setActiveFolderId(folders[0].id);
  }, [folders, activeFolderId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const items = getItemsByFolder(activeFolderId);
  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: isMobile ? 72 : 0 }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div
            style={{
              height: 52,
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              flexShrink: 0,
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-on-primary)' }}>Saved</div>
            {items.length > 0 && (
              <button
                onClick={() => clearFolder(activeFolderId)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: '8px 10px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Desktop layout: keep folder rail */}
        {!isMobile ? (
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
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
        ) : (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Mobile: folders as horizontal chips */}
            <div style={{ display: 'flex', gap: 10, padding: 12, overflowX: 'auto', borderBottom: '1px solid var(--border-color)' }}>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFolderId(f.id)}
                  style={{
                    flexShrink: 0,
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: f.id === activeFolderId ? '1px solid rgba(65,127,56,0.55)' : '1px solid rgba(255,255,255,0.08)',
                    background: f.id === activeFolderId ? 'rgba(65,127,56,0.12)' : 'rgba(255,255,255,0.04)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span aria-hidden style={{ width: 10, height: 10, borderRadius: 4, background: f.color, opacity: 0.92 }} />
                  {f.name}
                </button>
              ))}
            </div>

            {items.length === 0 ? (
              <div style={{ padding: 18, color: 'var(--text-muted)' }}>No saved ayahs in this folder.</div>
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
        )}
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="mobile-bottom-nav" role="navigation" aria-label="Primary">
          <button className="mobile-bottom-nav__btn" onClick={() => router.push('/')} aria-label="Surahs">
            <LayoutGrid size={22} />
          </button>
          <button className="mobile-bottom-nav__btn" onClick={() => router.push('/?search=1')} aria-label="Search">
            <Compass size={22} />
          </button>
          <button className="mobile-bottom-nav__btn active" onClick={() => router.push('/saved')} aria-label="Saved">
            <Bookmark size={22} />
          </button>
          <button className="mobile-bottom-nav__btn" onClick={() => router.push('/')} aria-label="Settings">
            <Settings size={22} />
          </button>
        </div>
      )}
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

