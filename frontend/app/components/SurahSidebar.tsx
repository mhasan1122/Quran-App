'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { PiDiamondFill } from 'react-icons/pi';
import { surahs } from '../data/surahs';
import { revelationShortLabel } from '../data/revelationIcons';

interface Props {
  activeSurah: number;
  onSelect: (num: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SurahSidebar({ activeSurah, onSelect, isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const activeRef = useRef<HTMLDivElement>(null);

  const filtered = surahs.filter(s =>
    !query ||
    s.englishName.toLowerCase().includes(query.toLowerCase()) ||
    s.name.includes(query) ||
    s.number.toString().includes(query) ||
    s.englishNameTranslation.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSurah]);

  return (
    <div
      className={`surah-sidebar`}
      style={{
        width: '100%',
        minWidth: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        ...(isOpen ? { transform: 'translateX(0)' } : {}),
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Quran Mazid
        </span>
       
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: 4, display: 'none',
          }}
          className="mobile-close-btn"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="search-input"
          placeholder="Search surah..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Surah List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(surah => (
          <div
            key={surah.number}
            ref={surah.number === activeSurah ? activeRef : null}
            className={`surah-item ${surah.number === activeSurah ? 'active' : ''}`}
            onClick={() => { onSelect(surah.number); onClose(); }}
          >
            <span className="surah-diamond-badge" aria-hidden="true">
              <PiDiamondFill className="surah-diamond-icon" />
              <span className="surah-diamond-number">{surah.number}</span>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontSize: 18, lineHeight: '28px', fontWeight: 400, letterSpacing: 'normal', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                  {surah.englishName}
                </span>
                <span style={{ fontSize: 18, fontFamily: 'Amiri, serif', color: '#787D7A', direction: 'rtl' }}>
                  {surah.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {surah.numberOfAyahs} Ayahs · {revelationShortLabel(surah.revelationType)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
