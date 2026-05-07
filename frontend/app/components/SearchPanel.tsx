'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';

interface SearchResult {
  numberInSurah: number;
  text: string;
  surahNumber: number;
  surahName: string;
}

interface Props {
  onNavigate: (surahNum: number) => void;
  variant?: 'sidebar' | 'modal';
  onClose?: () => void;
}

type RecentNav = { surahNumber: number; surahName?: string; ts: number };

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchPanel({ onNavigate, variant = 'sidebar', onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isModal = variant === 'modal';

  const [recentNav, setRecentNav] = useState<RecentNav[]>([]);

  useEffect(() => {
    if (!isModal) return;
    try {
      const raw = localStorage.getItem('qm-recent-nav');
      if (raw) setRecentNav(JSON.parse(raw));
    } catch {}
  }, [isModal]);

  const saveRecentNav = (entry: RecentNav) => {
    try {
      const next = [entry, ...recentNav]
        .filter((x, idx, arr) => arr.findIndex(a => a.surahNumber === x.surahNumber) === idx)
        .slice(0, 8);
      setRecentNav(next);
      localStorage.setItem('qm-recent-nav', JSON.stringify(next));
    } catch {}
  };

  const chips = useMemo(
    () => [
      { label: 'Al-Fatiha', surahNumber: 1 },
      { label: 'Juz 30', surahNumber: 78 },
      { label: 'Surah Yasin', surahNumber: 36 },
      { label: 'Surah Al-Kahf', surahNumber: 18 },
    ],
    []
  );

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/en.sahih`);
      const data = await res.json();
      if (data.data?.matches) {
        setResults(data.data.matches.slice(0, 30).map((m: any) => ({
          numberInSurah: m.numberInSurah,
          text: m.text,
          surahNumber: m.surah?.number,
          surahName: m.surah?.englishName,
        })));
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleChange = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 500);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: isModal ? 'rgba(24,24,24,0.92)' : 'var(--bg-secondary)',
        ...(isModal
          ? {
              width: 'min(860px, 94vw)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 22,
              overflow: 'hidden' as const,
              backdropFilter: 'blur(10px)',
            }
          : { borderRight: '1px solid var(--border-color)', width: 340, minWidth: 340, flexShrink: 0 }),
      }}
    >
      {/* Modal-style top bar */}
      {isModal ? (
        <div style={{ padding: 18, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(65,127,56,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Search size={16} style={{ color: 'var(--accent-gold)' }} />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={query}
                onChange={e => handleChange(e.target.value)}
                placeholder="Find wisdom in the Quran"
                autoFocus
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 14,
                  padding: '0 14px 0 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-muted)',
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close search"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: 10,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid var(--border-color)', gap: 8 }}>
          <Search size={15} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Search</span>
        </div>
      )}

      {/* Search input (sidebar only) */}
      {!isModal && (
        <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            placeholder="Search by English translation..."
            value={query}
            onChange={e => handleChange(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isModal && !query && !searched && (
          <div style={{ padding: '18px 18px 8px' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 10 }}>Try to navigate</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {chips.map((c) => (
                <button
                  key={c.label}
                  onClick={() => { onNavigate(c.surahNumber); saveRecentNav({ surahNumber: c.surahNumber, surahName: c.label, ts: Date.now() }); onClose?.(); }}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-secondary)',
                    padding: '10px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {recentNav.length > 0 && (
              <>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>Recent Navigation</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentNav.slice(0, 4).map((r) => (
                      <button
                        key={r.surahNumber}
                        onClick={() => { onNavigate(r.surahNumber); onClose?.(); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '10px 6px',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 18, width: 22 }}>→</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          Search In Translation: {r.surahName ?? `Surah ${r.surahNumber}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 }}>
            <Loader2 size={18} style={{ color: 'var(--accent-gold)', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching...</span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No results found for "{query}"</p>
          </div>
        )}

        {!isModal && !loading && !searched && !query && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12, fontFamily: 'Amiri, serif', color: 'var(--accent-gold)', direction: 'rtl' }}>
              ٱقْرَأْ
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
              Search across all 114 Surahs by English translation text.
            </p>
          </div>
        )}

        {!loading && results.map((r, i) => (
          <button
            key={i}
            onClick={() => {
              onNavigate(r.surahNumber);
              if (isModal) saveRecentNav({ surahNumber: r.surahNumber, surahName: r.surahName, ts: Date.now() });
              onClose?.();
            }}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px',
              background: 'none',
              border: 'none',
              borderBottom: `1px solid ${isModal ? 'rgba(255,255,255,0.06)' : 'var(--border-color)'}`,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 600 }}>
                {r.surahName} · {r.surahNumber}:{r.numberInSurah}
              </span>
              <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'Lato, sans-serif' }}>
              {highlightText(r.text, query)}
            </p>
          </button>
        ))}

        {results.length > 0 && (
          <div style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Showing {results.length} results
          </div>
        )}
      </div>
    </div>
  );
}
