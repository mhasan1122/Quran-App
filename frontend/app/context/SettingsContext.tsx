'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ArabicFont = 'amiri' | 'scheherazade' | 'noto-arabic';

interface Settings {
  arabicFont: ArabicFont;
  arabicFontSize: number;
  translationFontSize: number;
  showTranslation: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  arabicFont: 'amiri',
  arabicFontSize: 28,
  translationFontSize: 15,
  showTranslation: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qm-settings');
      if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      try { localStorage.setItem('qm-settings', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

export function getArabicFontClass(font: ArabicFont): string {
  switch (font) {
    case 'scheherazade': return 'font-scheherazade';
    case 'noto-arabic': return 'font-noto-arabic';
    default: return 'font-amiri';
  }
}

export function getArabicFontLabel(font: ArabicFont): string {
  switch (font) {
    case 'amiri': return 'Amiri';
    case 'scheherazade': return 'Scheherazade New';
    case 'noto-arabic': return 'Noto Naskh Arabic';
  }
}
