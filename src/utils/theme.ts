import { SchoolThemeConfig, ThemePresetId } from '../types/tka';

export interface ThemePresetDefinition {
  id: Exclude<ThemePresetId, 'custom'>;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'emerald-man1',
    name: 'Hijau Zamrud MAN 1 Jember',
    description: 'Identitas resmi madrasah dengan aksen emas cendekia.',
    primaryColor: '#065f46',
    accentColor: '#b45309',
  },
  {
    id: 'navy-akademik',
    name: 'Biru Akademik Nusantara',
    description: 'Nuansa biru tua formal untuk asesmen TKA dan ujian akhir.',
    primaryColor: '#1e3a8a',
    accentColor: '#0284c7',
  },
  {
    id: 'maroon-madrasah',
    name: 'Marun Klasik Cendekia',
    description: 'Kombinasi merah marun elegan dan emas hangat.',
    primaryColor: '#881337',
    accentColor: '#d97706',
  },
  {
    id: 'slate-cendekia',
    name: 'Arang Minimalis',
    description: 'Tampilan monokrom modern berfokus pada keterbacaan naskah.',
    primaryColor: '#0f172a',
    accentColor: '#0d9488',
  },
];

export const DEFAULT_THEME_CONFIG: SchoolThemeConfig = {
  presetId: 'emerald-man1',
  mode: 'light',
  primaryColor: '#065f46',
  accentColor: '#b45309',
  schoolName: 'MAN 1 Jember',
  schoolSubtitle: 'Jl. Imam Bonjol No. 50, Jember · Kementerian Agama RI',
  academicYear: '2026/2027',
  customLogoDataUrl: null,
};

export const THEME_STORAGE_KEY = 'man1jember_tka_theme_v1';

export function hexToSoftBg(hex: string, alpha = 0.08): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(6, 95, 70, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(6, 95, 70, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenHex(hex: string, amount = 18): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#047857';
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lightenHex(hex: string, amount = 95): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#6ee7b7';
  const r = Math.min(255, parseInt(clean.slice(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(clean.slice(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(clean.slice(4, 6), 16) + amount);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function loadSavedTheme(): SchoolThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME_CONFIG;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SchoolThemeConfig>;
    return {
      ...DEFAULT_THEME_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveTheme(theme: SchoolThemeConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Ignore quota errors on custom uploaded logos
  }
}

export function applyThemeToDocument(theme: SchoolThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', theme.primaryColor);
  root.style.setProperty('--brand-primary-hover', darkenHex(theme.primaryColor, 16));
  root.style.setProperty('--brand-primary-soft', hexToSoftBg(theme.primaryColor, 0.1));
  root.style.setProperty('--brand-accent', theme.accentColor);
  if (theme.mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
