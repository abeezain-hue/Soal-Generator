import React, { useRef } from 'react';
import { Moon, RotateCcw, Sun, Upload, X } from 'lucide-react';
import { SchoolThemeConfig } from '../types/tka';
import { DEFAULT_THEME_CONFIG, THEME_PRESETS } from '../utils/theme';
import { SchoolEmblem } from './Header';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  theme: SchoolThemeConfig;
  onChangeTheme: (next: SchoolThemeConfig) => void;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  theme,
  onChangeTheme,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeTheme({ ...theme, customLogoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2
              id="theme-modal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Kustomisasi Tema &amp; Identitas Sekolah
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sesuaikan palet warna, mode tampilan, logo, dan kop naskah madrasah.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel kustomisasi tema"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Mode Terang / Gelap */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mode Tampilan Antarmuka
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeTheme({ ...theme, mode: 'light' })}
                className={`p-3 rounded-lg border text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer ${
                  theme.mode === 'light'
                    ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4" aria-hidden="true" />
                <span>Mode Terang</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme({ ...theme, mode: 'dark' })}
                className={`p-3 rounded-lg border text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer ${
                  theme.mode === 'dark'
                    ? 'border-slate-900 dark:border-white bg-slate-900 text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span>Mode Gelap</span>
              </button>
            </div>
          </div>

          {/* Preset Warna Identitas Sekolah */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Palet Identitas Sekolah
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const selected = theme.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onChangeTheme({
                        ...theme,
                        presetId: preset.id,
                        primaryColor: preset.primaryColor,
                        accentColor: preset.accentColor,
                      })
                    }
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {preset.name}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-black/10"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-black/10"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="primary-color-picker"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Warna Primer Sekolah
              </label>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950">
                <input
                  id="primary-color-picker"
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    onChangeTheme({
                      ...theme,
                      presetId: 'custom',
                      primaryColor: e.target.value,
                    })
                  }
                  className="h-7 w-9 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="font-mono-tabular text-xs text-slate-700 dark:text-slate-300 uppercase">
                  {theme.primaryColor}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="accent-color-picker"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Warna Aksen Kop
              </label>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950">
                <input
                  id="accent-color-picker"
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) =>
                    onChangeTheme({
                      ...theme,
                      presetId: 'custom',
                      accentColor: e.target.value,
                    })
                  }
                  className="h-7 w-9 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="font-mono-tabular text-xs text-slate-700 dark:text-slate-300 uppercase">
                  {theme.accentColor}
                </span>
              </div>
            </div>
          </div>

          {/* Identitas Kop Naskah & Logo */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Identitas Kop Naskah &amp; Logo Madrasah
            </h3>

            <div className="flex items-center gap-4">
              <SchoolEmblem
                logoUrl={theme.customLogoDataUrl}
                schoolName={theme.schoolName}
                sizeClass="h-14 w-14"
              />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Unggah Logo Kustom</span>
                </button>
                {theme.customLogoDataUrl && (
                  <button
                    type="button"
                    onClick={() => onChangeTheme({ ...theme, customLogoDataUrl: null })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Gunakan Logo MAN 1 Jember
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="school-name-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Nama Sekolah / Madrasah
                </label>
                <input
                  id="school-name-input"
                  type="text"
                  value={theme.schoolName}
                  onChange={(e) => onChangeTheme({ ...theme, schoolName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="academic-year-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Tahun Ajaran
                </label>
                <input
                  id="academic-year-input"
                  type="text"
                  value={theme.academicYear}
                  onChange={(e) => onChangeTheme({ ...theme, academicYear: e.target.value })}
                  className="w-full font-mono-tabular rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="school-subtitle-input"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Alamat / Subjudul Kop
              </label>
              <input
                id="school-subtitle-input"
                type="text"
                value={theme.schoolSubtitle}
                onChange={(e) => onChangeTheme({ ...theme, schoolSubtitle: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => onChangeTheme(DEFAULT_THEME_CONFIG)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset ke Standar MAN 1 Jember</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Terapkan Tema
          </button>
        </div>
      </div>
    </div>
  );
};
