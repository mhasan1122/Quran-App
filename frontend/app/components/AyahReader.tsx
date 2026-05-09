'use client';
import { useEffect, useState, useRef } from 'react';
import { Bookmark, Share2, Copy, ChevronLeft, ChevronRight, Loader2, Play, Pause } from 'lucide-react';
import { fetchSurah, SurahData } from '../lib/quranApi';
import { revelationImagePath, revelationShortLabel } from '../data/revelationIcons';
import { useSettings, getArabicFontClass } from '../context/SettingsContext';
import { useCollections } from '../context/CollectionsContext';
import AddToCollectionsModal from './AddToCollectionsModal';

interface Props {
  surahNumber: number;
}

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

// Surahs that don't have Basmala (At-Tawbah = 9, Al-Fatihah has it as first verse)
const NO_BASMALA = [1, 9];

export default function AyahReader({ surahNumber }: Props) {
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<{ surahNumber: number; ayahNumberInSurah: number; arabicText: string; translation: string } | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [playingWord, setPlayingWord] = useState<{ ayah: number; word: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playSourceRef = useRef<'ayah' | 'word' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { getFolders, isInFolder } = useCollections();
  const arabicFontClass = getArabicFontClass(settings.arabicFont);
  const favoritesFolderId = getFolders('bookmark')[0]?.id ?? 'favorites';

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    playSourceRef.current = null;
    setPlayingAyah(null);
    setPlayingWord(null);
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  useEffect(() => {
    stopAudio();
  }, [surahNumber]);

  const playUrl = (url: string, source: 'ayah' | 'word', onStart: () => void) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const a = new Audio(url);
    a.preload = 'auto';
    audioRef.current = a;
    playSourceRef.current = source;
    a.addEventListener('ended', () => {
      if (audioRef.current === a) stopAudio();
    });
    a.addEventListener('error', () => {
      if (audioRef.current === a) stopAudio();
    });
    onStart();
    void a.play().catch(() => {
      if (audioRef.current === a) stopAudio();
    });
  };

  const togglePlayAyah = (ayahNumberInSurah: number, url: string | null) => {
    if (!url) return;
    if (playSourceRef.current === 'ayah' && playingAyah === ayahNumberInSurah) {
      stopAudio();
      return;
    }
    playUrl(url, 'ayah', () => {
      setPlayingAyah(ayahNumberInSurah);
      setPlayingWord(null);
    });
  };

  // Word-by-word audio uses Quran.com's free CDN:
  //   https://audio.qurancdn.com/wbw/{SSS}_{AAA}_{WWW}.mp3
  const wordAudioUrl = (surah: number, ayah: number, wordIndex1Based: number) =>
    `https://audio.qurancdn.com/wbw/${String(surah).padStart(3, '0')}_${String(ayah).padStart(3, '0')}_${String(wordIndex1Based).padStart(3, '0')}.mp3`;

  const playWord = (ayahNumberInSurah: number, wordIndex1Based: number) => {
    const url = wordAudioUrl(surahNumber, ayahNumberInSurah, wordIndex1Based);
    if (
      playSourceRef.current === 'word' &&
      playingWord?.ayah === ayahNumberInSurah &&
      playingWord?.word === wordIndex1Based
    ) {
      stopAudio();
      return;
    }
    playUrl(url, 'word', () => {
      setPlayingWord({ ayah: ayahNumberInSurah, word: wordIndex1Based });
      setPlayingAyah(null);
    });
  };

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
                  width={100}
                  height={100}
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
              <div key={ayah.numberInSurah} className="ayah-card">
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
                      <span className="ayah-ref-mobile">{surahData.number}:{ayah.numberInSurah}</span>
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => togglePlayAyah(ayah.numberInSurah, ayah.audio)}
                      disabled={!ayah.audio}
                      className="ayah-action-btn"
                      style={{
                        background: playingAyah === ayah.numberInSurah ? 'var(--accent-muted-bg)' : 'none',
                        color: playingAyah === ayah.numberInSurah ? 'var(--accent-gold)' : 'var(--text-muted)',
                        cursor: ayah.audio ? 'pointer' : 'not-allowed',
                      }}
                      title={playingAyah === ayah.numberInSurah ? 'Pause recitation' : 'Play recitation'}
                    >
                      {playingAyah === ayah.numberInSurah ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={() => handleCopy(`${ayah.text}\n\n${ayah.translation}`, ayah.numberInSurah)}
                      className="ayah-action-btn"
                      style={{
                        color: copied === ayah.numberInSurah ? 'var(--accent-gold)' : 'var(--text-muted)',
                      }}
                      title="Copy verse"
                    >
                      <Copy size={20} />
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
                      className="ayah-action-btn"
                      style={{
                        color: isInFolder(favoritesFolderId, surahNumber, ayah.numberInSurah) ? 'var(--accent-gold)' : 'var(--text-muted)',
                      }}
                      title={isInFolder(favoritesFolderId, surahNumber, ayah.numberInSurah) ? 'Saved' : 'Save'}
                    >
                      <Bookmark size={20} />
                    </button>
                    <button
                      className="ayah-action-btn"
                      style={{ color: 'var(--text-muted)' }}
                      title="Share"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text — click any word to play it */}
                {(() => {
                  const words = ayah.text.split(/\s+/).filter(Boolean);
                  return (
                    <p
                      className={`arabic-text ${arabicFontClass} ${playingAyah === ayah.numberInSurah ? 'arabic-text--playing' : ''}`}
                      style={{ fontSize: settings.arabicFontSize, color: 'var(--text-primary)', marginBottom: 14, paddingBottom: 14, borderBottom: settings.showTranslation ? '1px solid var(--border-color)' : 'none' }}
                    >
                      {words.map((word, idx) => {
                        const wordNum = idx + 1;
                        const isPlaying =
                          playingWord?.ayah === ayah.numberInSurah && playingWord?.word === wordNum;
                        return (
                          <span
                            key={`${ayah.numberInSurah}-${wordNum}`}
                            className={`arabic-word ${isPlaying ? 'arabic-word--playing' : ''}`}
                            onClick={() => playWord(ayah.numberInSurah, wordNum)}
                            title="Click to play this word"
                          >
                            {word}
                            {idx < words.length - 1 ? ' ' : ''}
                          </span>
                        );
                      })}
                    </p>
                  );
                })()}

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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
