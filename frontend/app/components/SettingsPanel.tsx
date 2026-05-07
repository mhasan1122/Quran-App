'use client';
import { X, Type } from 'lucide-react';
import { useSettings, ArabicFont, getArabicFontLabel } from '../context/SettingsContext';

interface Props {
  onClose?: () => void;
  variant?: 'popover' | 'docked';
}

const arabicFonts: ArabicFont[] = ['amiri', 'scheherazade', 'noto-arabic'];

const arabicFontClass: Record<ArabicFont, string> = {
  amiri: 'font-amiri',
  scheherazade: 'font-scheherazade',
  'noto-arabic': 'font-noto-arabic',
};

function rangeFillStyle(value: number, min: number, max: number) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return {
    background: `linear-gradient(to right, var(--accent-gold) 0%, var(--accent-gold) ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
  } as const;
}

export default function SettingsPanel({ onClose, variant = 'popover' }: Props) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className={`settings-panel ${variant === 'docked' ? 'settings-panel--docked' : ''}`}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Type size={15} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-on-primary)' }}>Display Settings</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
            <X size={15} />
          </button>
        )}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Arabic Font Family */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--accent-on-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
            Arabic Font
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {arabicFonts.map(font => (
              <button
                key={font}
                onClick={() => updateSettings({ arabicFont: font })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${settings.arabicFont === font ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                  background: settings.arabicFont === font ? 'var(--accent-muted-bg)' : 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14, color: settings.arabicFont === font ? 'var(--accent-gold-light)' : 'var(--accent-on-primary)' }}>
                  {getArabicFontLabel(font)}
                </span>
                <span
                  className={arabicFontClass[font]}
                  style={{ fontSize: 18, color: 'var(--accent-gold-light)', direction: 'rtl' }}
                >
                  بسم الله
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Arabic Font Size */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-on-primary)' }}>
              Arabic Font Size
            </span>
            <span style={{ fontSize: 18, color: 'var(--accent-gold-light)', fontWeight: 800 }}>
              {settings.arabicFontSize}
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={48}
            step={2}
            value={settings.arabicFontSize}
            onChange={e => updateSettings({ arabicFontSize: Number(e.target.value) })}
            style={rangeFillStyle(settings.arabicFontSize, 20, 48)}
          />
        </div>

        {/* Translation Font Size */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-on-primary)' }}>
              Translation Font Size
            </span>
            <span style={{ fontSize: 18, color: 'var(--accent-gold-light)', fontWeight: 800 }}>
              {settings.translationFontSize}
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={settings.translationFontSize}
            onChange={e => updateSettings({ translationFontSize: Number(e.target.value) })}
            style={rangeFillStyle(settings.translationFontSize, 12, 22)}
          />
        </div>

        {/* Show Translation Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: 'var(--accent-on-primary)' }}>Show Translation</span>
          <button
            onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: settings.showTranslation ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              border: `1px solid ${settings.showTranslation ? 'var(--accent-gold)' : 'var(--border-light)'}`,
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: settings.showTranslation ? 18 : 2,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}
