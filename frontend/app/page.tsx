'use client';
import { useState, useEffect, useRef } from 'react';
import { Settings, Menu, Search, LayoutGrid, Compass, Bookmark } from 'lucide-react';
import IconSidebar from './components/IconSidebar';
import SurahSidebar from './components/SurahSidebar';
import AyahReader from './components/AyahReader';
import SearchPanel from './components/SearchPanel';
import SettingsPanel from './components/SettingsPanel';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
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
      {/* Desktop left rails */}
      {!isMobile && (
        <>
          <IconSidebar activePanel={activePanel} onPanelChange={handlePanelChange} />
          <div
            style={{
              width: 'var(--sidebar-surah-width)',
              minWidth: 'var(--sidebar-surah-width)',
              display: showLeftPanel ? 'flex' : 'none',
              flexDirection: 'column',
            }}
          >
            <SurahSidebar
              activeSurah={activeSurah}
              onSelect={handleSurahSelect}
              isOpen={true}
              onClose={() => setSurahSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Mobile surah overlay (full screen, no sidebar) */}
      {isMobile && surahSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-secondary)' }}>
            <SurahSidebar
              activeSurah={activeSurah}
              onSelect={handleSurahSelect}
              isOpen={true}
              onClose={() => setSurahSidebarOpen(false)}
            />
          </div>
        </div>
      )}

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
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          minWidth: 0,
          paddingBottom: isMobile ? 72 : 0,
        }}
      >
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
          <div
            className="mobile-appbar"
            style={{
              height: 52,
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => {
                setActivePanel('surah');
                setSurahSidebarOpen(true);
              }}
              aria-label="Open surah list"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 10, flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--accent-on-primary)',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Quran Mazid
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button
                onClick={() => setActivePanel('search')}
                aria-label="Search"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => setSettingsOpen((v) => !v)}
                aria-label="Display settings"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={18} />
              </button>
            </div>
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

      {/* Mobile bottom navigation (reference style) */}
      {isMobile && (
        <div className="mobile-bottom-nav" role="navigation" aria-label="Primary">
          <button
            className={`mobile-bottom-nav__btn ${surahSidebarOpen ? 'active' : ''}`}
            onClick={() => {
              setActivePanel('surah');
              setSettingsOpen(false);
              setSurahSidebarOpen(true);
            }}
            aria-label="Surahs"
          >
            <LayoutGrid size={22} />
          </button>
          <button
            className={`mobile-bottom-nav__btn ${activePanel === 'search' ? 'active' : ''}`}
            onClick={() => {
              setSurahSidebarOpen(false);
              setSettingsOpen(false);
              setActivePanel('search');
            }}
            aria-label="Search"
          >
            <Compass size={22} />
          </button>
          <button
            className="mobile-bottom-nav__btn"
            onClick={() => router.push('/saved')}
            aria-label="Saved"
          >
            <Bookmark size={22} />
          </button>
          <button
            className={`mobile-bottom-nav__btn ${settingsOpen ? 'active' : ''}`}
            onClick={() => {
              setSurahSidebarOpen(false);
              setActivePanel('surah');
              setSettingsOpen(v => !v);
            }}
            aria-label="Settings"
          >
            <Settings size={22} />
          </button>
        </div>
      )}

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
