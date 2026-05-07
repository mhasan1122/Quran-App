'use client';
import { useEffect, useState, useRef } from 'react';
import { Bookmark, Share2, Copy, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchSurah, SurahData } from '../lib/quranApi';
import { revelationImagePath, revelationShortLabel } from '../data/revelationIcons';
import { useSettings, getArabicFontClass } from '../context/SettingsContext';
import { useCollections } from '../context/CollectionsContext';
import AddToCollectionsModal from './AddToCollectionsModal';

interface Props {
  surahNumber: number;
  onPrev: () => void;
  onNext: () => void;
}

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

// Surahs that don't have Basmala (At-Tawbah = 9, Al-Fatihah has it as first verse)
const NO_BASMALA = [1, 9];

export default function AyahReader({ surahNumber, onPrev, onNext }: Props) {
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<{ surahNumber: number; ayahNumberInSurah: number; arabicText: string; translation: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { getFolders, isInFolder } = useCollections();
  const arabicFontClass = getArabicFontClass(settings.arabicFont);
  const favoritesFolderId = getFolders('bookmark')[0]?.id ?? 'favorites';

  useEffect(() => {
    setLoading(true);
    setError('');
    setSurahData(null);
    if (containerRef.current) containerRef.current.scrollTop = 0;

    fetchSurah(surahNumber)
      .then(data => { setSurahData(data); setLoading(false); })
      .catch(() => { setError('Failed to load surah. Please check your connection and try again.'); setLoading(false); });
  }, [surahNumber]);

  const handleCopy = (text: string, ayahNum: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(ayahNum);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <AddToCollectionsModal
        open={addOpen}
        ayah={selectedAyah}
        onClose={() => { setAddOpen(false); setSelectedAyah(null); }}
      />
      {/* Top Bar */}
      <div className="top-header" style={{ justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onPrev}
            disabled={surahNumber <= 1}
            style={{
              background: 'none', border: '1px solid var(--border-color)', borderRadius: 4,
              color: surahNumber <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: surahNumber <= 1 ? 'not-allowed' : 'pointer',
              padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
            }}
          >
            <ChevronLeft size={14} />
            <span className="hide-mobile">Prev</span>
          </button>
          <button
            onClick={onNext}
            disabled={surahNumber >= 114}
            style={{
              background: 'none', border: '1px solid var(--border-color)', borderRadius: 4,
              color: surahNumber >= 114 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: surahNumber >= 114 ? 'not-allowed' : 'pointer',
              padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
            }}
          >
            <span className="hide-mobile">Next</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ width: 80 }} />
      </div>

      {/* Content */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 16 }}>
            <Loader2 size={32} style={{ color: 'var(--accent-gold)', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading Surah...</span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 12, padding: 24 }}>
            <div style={{ fontSize: 32 }}>⚠️</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>{error}</p>
            <button
              onClick={() => { setLoading(true); setError(''); fetchSurah(surahNumber).then(d => { setSurahData(d); setLoading(false); }).catch(() => { setError('Failed to load.'); setLoading(false); }); }}
              style={{ background: 'var(--accent-gold)', color: 'var(--accent-on-primary)', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        )}

        {surahData && (
          <>
            {/* Compact header — reference: charcoal strip, faint icon left, white title + grey meta */}
            <div className={`surah-header-strip ${surahData.revelationType === 'Meccan' ? 'surah-header-strip--makkah' : ''}`}>
              <div className="surah-header-strip-inner">
                <img
                  src={revelationImagePath(surahData.revelationType)}
                  alt=""
                  width={16}
                  height={16}
                  className="revelation-strip-icon"
                />
                <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                  <div className="surah-header-strip-title">
                    Surah {surahData.englishName.replace(/-/g, ' ')}
                  </div>
                  <div className="surah-header-strip-meta">
                    Ayah-{surahData.numberOfAyahs}, {revelationShortLabel(surahData.revelationType)}
                  </div>
                </div>
                <div className="surah-header-strip-spacer" aria-hidden />
              </div>
            </div>

            <div className="surah-arabic-subtitle">
              <p className={`surah-arabic-title ${arabicFontClass}`}>{surahData.name}</p>
            </div>

            {/* Bismillah */}
            {!NO_BASMALA.includes(surahData.number) && (
              <div className="bismillah">{BASMALA}</div>
            )}

            {/* Ayahs */}
            {surahData.ayahs.map((ayah) => (
              <div key={ayah.number} className="ayah-card">
                {/* Verse Number Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Octagon verse number */}
                    <div style={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', flexShrink: 0,
                    }}>
                      <svg viewBox="0 0 32 32" width={32} height={32} style={{ position: 'absolute' }}>
                        <path
                          d="M10,2 L22,2 L30,10 L30,22 L22,30 L10,30 L2,22 L2,10 Z"
                          fill="none" stroke="var(--accent-gold)" strokeWidth="1"
                        />
                      </svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', position: 'relative', zIndex: 1, lineHeight: 1 }}>
                        {ayah.numberInSurah}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {surahData.number}:{ayah.numberInSurah}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleCopy(`${ayah.text}\n\n${ayah.translation}`, ayah.numberInSurah)}
                      style={{
                        background: 'none', border: 'none', color: copied === ayah.numberInSurah ? 'var(--accent-gold)' : 'var(--text-muted)',
                        cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.15s',
                        display: 'flex', alignItems: 'center',
                      }}
                      title="Copy verse"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAyah({
                          surahNumber,
                          ayahNumberInSurah: ayah.numberInSurah,
                          arabicText: ayah.text,
                          translation: ayah.translation,
                        });
                        setAddOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isInFolder(favoritesFolderId, surahNumber, ayah.numberInSurah) ? 'var(--accent-gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s',
                      }}
                      title={isInFolder(favoritesFolderId, surahNumber, ayah.numberInSurah) ? 'Saved' : 'Save'}
                    >
                      <Bookmark size={13} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}
                      title="Share"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <p
                  className={`arabic-text ${arabicFontClass}`}
                  style={{ fontSize: settings.arabicFontSize, color: 'var(--text-primary)', marginBottom: 14, paddingBottom: 14, borderBottom: settings.showTranslation ? '1px solid var(--border-color)' : 'none' }}
                >
                  {ayah.text}
                </p>

                {/* Translation */}
                {settings.showTranslation && (
                  <p style={{ fontSize: settings.translationFontSize, color: 'var(--accent-on-primary)', lineHeight: 1.75, fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
                    {ayah.translation}
                  </p>
                )}
              </div>
            ))}

            {/* End of Surah */}
            <div style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                — End of Surah {surahData.englishName} —
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {surahNumber > 1 && (
                  <button
                    onClick={onPrev}
                    style={{
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 6,
                      color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px 18px',
                      fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <ChevronLeft size={14} /> Previous Surah
                  </button>
                )}
                {surahNumber < 114 && (
                  <button
                    onClick={onNext}
                    style={{
                      background: 'var(--accent-gold)', border: 'none', borderRadius: 6,
                      color: 'var(--accent-on-primary)', cursor: 'pointer', padding: '8px 18px',
                      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    Next Surah <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
