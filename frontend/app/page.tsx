'use client';
import { useState, useEffect, useRef } from 'react';
import { Settings, Menu, Search } from 'lucide-react';
import IconSidebar from './components/IconSidebar';
import SurahSidebar from './components/SurahSidebar';
import AyahReader from './components/AyahReader';
import SearchPanel from './components/SearchPanel';
import SettingsPanel from './components/SettingsPanel';

export default function Home() {
  const [activeSurah, setActiveSurah] = useState(1);
  const [activePanel, setActivePanel] = useState('surah');
  const [surahSidebarOpen, setSurahSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dockSettings, setDockSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      // Dock settings on most desktop/tablet widths (like Quran Mazid).
      setDockSettings(w >= 900);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handlePanelChange = (panel: string) => {
    // Desktop: settings is always visible (docked on the right)
    if (panel === 'settings') { setSettingsOpen(v => !v); return; }
    if (panel === 'surah') { setActivePanel('surah'); setSurahSidebarOpen(true); return; }
    setActivePanel(panel);
  };

  const handleSurahSelect = (num: number) => {
    setActiveSurah(num);
    if (isMobile) setSurahSidebarOpen(false);
  };

  const showLeftPanel = !isMobile || activePanel === 'surah';
  const showSearchModal = activePanel === 'search';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      {isMobile && surahSidebarOpen && (
        <div onClick={() => setSurahSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 45 }} />
      )}

      {/* Icon Sidebar */}
      <IconSidebar activePanel={activePanel} onPanelChange={handlePanelChange} />

      {/* Surah Sidebar (desktop: always in middle, mobile: drawer) */}
      <div style={{
        width: 'var(--sidebar-surah-width)', minWidth: 'var(--sidebar-surah-width)',
        display: showLeftPanel ? 'flex' : (isMobile ? 'flex' : 'none'),
        flexDirection: 'column',
        ...(isMobile ? {
          position: 'fixed', left: 56, top: 0, height: '100%', zIndex: 50,
          transform: surahSidebarOpen ? 'translateX(0)' : 'translateX(-110%)',
          transition: 'transform 0.25s ease',
          boxShadow: surahSidebarOpen ? '4px 0 24px rgba(0,0,0,0.5)' : 'none',
        } : {}),
      }}>
        <SurahSidebar activeSurah={activeSurah} onSelect={handleSurahSelect} isOpen={surahSidebarOpen} onClose={() => setSurahSidebarOpen(false)} />
      </div>

      {/* Search modal overlay */}
      {showSearchModal && (
        <div
          onClick={() => setActivePanel('surah')}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 250,
            display: 'flex',
            justifyContent: 'center',
            alignItems: isMobile ? 'stretch' : 'center',
            padding: isMobile ? 0 : 18,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              height: isMobile ? '100%' : 'min(78vh, 720px)',
              width: isMobile ? '100%' : 'auto',
              borderRadius: isMobile ? 0 : 14,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
            }}
          >
            <SearchPanel
              variant="modal"
              onClose={() => setActivePanel('surah')}
              onNavigate={(num) => { setActiveSurah(num); setActivePanel('surah'); }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minWidth: 0 }}>
        {/* Desktop navbar */}
        {!isMobile && (
          <div className="top-header" style={{ justifyContent: 'space-between', gap: 10 }}>
           

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
              <button
                onClick={() => setActivePanel(p => (p === 'search' ? 'surah' : 'search'))}
                style={{
                  background: activePanel === 'search' ? 'var(--bg-tertiary)' : 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  color: activePanel === 'search' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 16,
                  lineHeight: '24px',
                  fontWeight: 400,
                }}
              >
                <Search size={18} />
                <span>Search</span>
              </button>

              <button
              onClick={() => { if (!dockSettings) setSettingsOpen(v => !v); }}
              style={{
                  background: (settingsOpen || dockSettings) ? 'var(--bg-tertiary)' : 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                  color: (settingsOpen || dockSettings) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: dockSettings ? 'not-allowed' : 'pointer',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
                lineHeight: '24px',
                fontWeight: 400,
                  opacity: dockSettings ? 0.6 : 1,
              }}
              title={dockSettings ? 'Settings (always open)' : 'Settings'}
            >
             
            </button>
            </div>
          </div>
        )}

        {/* Mobile header bar */}
        {isMobile && (
          <div style={{
            height: 48, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', flexShrink: 0,
            marginBottom: 12,
          }}>
            <button onClick={() => { setActivePanel('surah'); setSurahSidebarOpen(true); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Menu size={18} />
              <span style={{ fontSize: 13 }}>Surahs</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/quran%20icon.svg" alt="" width={26} height={26} style={{ display: 'block' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Quran Mazid</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 400, color: '#787D7A', lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Read, Study, and Learn The Quran
              </div>
            <button onClick={() => setSettingsOpen(v => !v)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
              <Settings size={18} />
            </button>
          </div>
        )}

        {/* Mobile / narrow settings overlay */}
        {!dockSettings && settingsOpen && (
          <div ref={settingsRef} style={{ position: 'relative', zIndex: 200 }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0 }}>
              <SettingsPanel onClose={() => setSettingsOpen(false)} />
            </div>
          </div>
        )}

        <AyahReader
          surahNumber={activeSurah}
          onPrev={() => setActiveSurah(n => Math.max(1, n - 1))}
          onNext={() => setActiveSurah(n => Math.min(114, n + 1))}
        />
      </div>

      {/* Settings (desktop: always visible right sidebar) */}
      {dockSettings && (
        <div
          style={{
            width: 'var(--sidebar-settings-width)',
            minWidth: 'var(--sidebar-settings-width)',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-color)',
            height: '100%',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <SettingsPanel variant="docked" />
        </div>
      )}
    </div>
  );
}
