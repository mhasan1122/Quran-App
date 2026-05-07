'use client';
import { BookOpen, Search, Settings, Bookmark, Home, Moon, List, Info } from 'lucide-react';

interface Props {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

const icons = [
  { id: 'surah', icon: List, label: 'Surahs' },
  { id: 'bookmark', icon: Bookmark, label: 'Saved' },
];

export default function IconSidebar({ activePanel, onPanelChange }: Props) {
  return (
    <div
      style={{
        width: 'var(--sidebar-icon-width)',
        minWidth: 'var(--sidebar-icon-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#417F38',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/quran%20icon.svg"
            alt="Quran Mazid"
            width={22}
            height={22}
            style={{ display: 'block', filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>

      {/* Nav icons */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: 8 }}>
        {icons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`icon-btn ${activePanel === id ? 'active' : ''}`}
            onClick={() => onPanelChange(activePanel === id ? '' : id)}
            title={label}
          >
            <span className="tooltip">{label}</span>
            <Icon size={18} strokeWidth={1.8} />
            <span className="icon-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Bottom spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom icon */}
      <div style={{ paddingBottom: 12, width: '100%' }}>
        <button className="icon-btn" title="About">
          <span className="tooltip">About</span>
          <Info size={16} strokeWidth={1.8} />
          <span className="icon-label">About</span>
        </button>
      </div>
    </div>
  );
}
