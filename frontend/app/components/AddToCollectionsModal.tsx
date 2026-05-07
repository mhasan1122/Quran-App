'use client';
import { useMemo, useState } from 'react';
import { Search, FolderPlus, Check } from 'lucide-react';
import { CollectionFolder, CollectionType, useCollections } from '../context/CollectionsContext';

type AyahInput = {
  surahNumber: number;
  ayahNumberInSurah: number;
  arabicText: string;
  translation: string;
};

const COLORS = ['#5DBB63', '#F2C94C', '#D66AE6', '#66B6FF', '#F25C8A', '#7380FF', '#55C9D6', '#9CCB54', '#FF8B73'];

export default function AddToCollectionsModal({
  open,
  onClose,
  ayah,
}: {
  open: boolean;
  onClose: () => void;
  ayah: AyahInput | null;
}) {
  const { getFolders, addToFolder, removeFromFolder, isInFolder, createFolder } = useCollections();
  const [activeType, setActiveType] = useState<CollectionType>('bookmark');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newType, setNewType] = useState<CollectionType>('bookmark');

  const folders = getFolders(activeType);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return folders;
    return folders.filter(f => f.name.toLowerCase().includes(q));
  }, [folders, query]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px, 96vw)',
          borderRadius: 18,
          background: 'rgba(23,23,23,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.65)',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ padding: '18px 18px 10px', textAlign: 'center', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
          Add to Collections
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 18px 12px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            {(['bookmark', 'pin'] as CollectionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  flex: 1,
                  height: 40,
                  background: activeType === t ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  color: activeType === t ? 'var(--text-primary)' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {t === 'bookmark' ? 'Bookmark' : 'Pin'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Bookmark Folder"
              style={{
                width: '100%',
                height: 46,
                borderRadius: 14,
                padding: '0 14px 0 42px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '0 18px 18px', maxHeight: '48vh', overflow: 'auto' }}>
          {!creating ? (
            <>
              {filtered.map((f) => (
                <FolderRow
                  key={f.id}
                  folder={f}
                  checked={!!ayah && isInFolder(f.id, ayah.surahNumber, ayah.ayahNumberInSurah)}
                  onToggle={() => {
                    if (!ayah) return;
                    const inFolder = isInFolder(f.id, ayah.surahNumber, ayah.ayahNumberInSurah);
                    if (inFolder) removeFromFolder(f.id, ayah.surahNumber, ayah.ayahNumberInSurah);
                    else addToFolder({ type: f.type, folderId: f.id, ...ayah });
                  }}
                />
              ))}

              {filtered.length === 0 && (
                <div style={{ padding: 18, textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                  No folders found.
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 6 }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                Create Folder Name
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Create name"
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 14,
                  padding: '0 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: 14,
                }}
              />

              <div style={{ marginTop: 18, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                Select folder color
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      border: newColor === c ? '2px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.12)',
                      background: c,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Pick folder color"
                  >
                    {newColor === c && <Check size={18} style={{ color: '#0b0b0b' }} />}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 18, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                Choose Folder Type
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <RadioRow
                  label="Bookmark"
                  sub="Collection contains bookmark items"
                  checked={newType === 'bookmark'}
                  onClick={() => setNewType('bookmark')}
                />
                <RadioRow
                  label="Pin"
                  sub="Collection contains pin items"
                  checked={newType === 'pin'}
                  onClick={() => setNewType('pin')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!creating ? (
            <>
              <button
                onClick={() => { setCreating(true); setNewName(''); setNewColor(COLORS[0]); setNewType(activeType); }}
                style={{
                  flex: 1,
                  height: 56,
                  background: '#3f7f38',
                  border: 'none',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  height: 56,
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCreating(false)}
                style={{
                  flex: 1,
                  height: 56,
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = newName.trim();
                  if (!name) return;
                  const folder = createFolder({ name, color: newColor, type: newType });
                  setCreating(false);
                  setActiveType(folder.type);
                  setQuery('');
                }}
                style={{
                  flex: 1,
                  height: 56,
                  background: '#3f7f38',
                  border: 'none',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FolderRow({ folder, checked, onToggle }: { folder: CollectionFolder; checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 10px',
        borderRadius: 12,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: checked ? 'none' : '1px solid rgba(255,255,255,0.14)',
          background: checked ? 'rgba(65,127,56,0.75)' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Check size={14} style={{ color: '#0b0b0b' }} />}
      </span>

      <span aria-hidden style={{ width: 22, height: 18, borderRadius: 4, background: folder.color, opacity: 0.92 }} />

      <span style={{ flex: 1, textAlign: 'left', color: 'rgba(255,255,255,0.82)', fontSize: 18, fontWeight: 700 }}>
        {folder.name}
      </span>
    </button>
  );
}

function RadioRow({ label, sub, checked, onClick }: { label: string; sub: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          border: checked ? '6px solid rgba(65,127,56,1)' : '2px solid rgba(255,255,255,0.25)',
          boxSizing: 'border-box',
          marginTop: 2,
        }}
      />
      <span style={{ textAlign: 'left' }}>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: 800 }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>{sub}</div>
      </span>
    </button>
  );
}

