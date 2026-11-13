import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { SchoolThemeConfig } from '../types/tka';

export type ActiveNavSection = 'builder' | 'preview' | 'theme' | 'guide';

interface HeaderProps {
  theme: SchoolThemeConfig;
  activeNav: ActiveNavSection;
  onNavigate: (section: ActiveNavSection) => void;
  onOpenExport: () => void;
}

const DEFAULT_MAN1_LOGO = '/src/assets/images/logo_man1_jember_1794557597929.jpg';

export const SchoolEmblem: React.FC<{
  logoUrl?: string | null;
  schoolName: string;
  sizeClass?: string;
}> = ({ logoUrl, schoolName, sizeClass = 'h-9 w-9' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = logoUrl || DEFAULT_MAN1_LOGO;

  if (imgFailed) {
    return (
      <div
        className={`${sizeClass} rounded-lg flex items-center justify-center shrink-0 text-white font-display font-bold text-xs border border-black/10`}
        style={{ backgroundColor: 'var(--brand-primary)' }}
        aria-label={`Logo ${schoolName}`}
      >
        M1J
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={`Logo ${schoolName}`}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`${sizeClass} rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5 shrink-0`}
    />
  );
};

export const Header: React.FC<HeaderProps> = ({
  theme,
  activeNav,
  onNavigate,
  onOpenExport,
}) => {
  const navItems: { id: ActiveNavSection; label: string }[] = [
    { id: 'builder', label: 'Penyusun Soal' },
    { id: 'preview', label: 'Pratinjau Naskah' },
    { id: 'theme', label: 'Kustomisasi Tema' },
    { id: 'guide', label: 'Panduan TKA' },
  ];

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark + MAN 1 Jember Emblem (1 line, no extra badges) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('builder');
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg"
        >
          <SchoolEmblem
            logoUrl={theme.customLogoDataUrl}
            schoolName={theme.schoolName}
            sizeClass="h-10 w-10"
          />
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
            {theme.schoolName}
          </span>
        </a>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 rounded-t ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                style={
                  isActive
                    ? {
                        borderColor:
                          theme.mode === 'dark' ? '#f8fafc' : 'var(--brand-primary)',
                        color: theme.mode === 'dark' ? '#f8fafc' : 'var(--brand-primary)',
                      }
                    : undefined
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Ekspor &amp; LMS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
