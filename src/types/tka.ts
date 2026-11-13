export type CognitiveLevel = 'L1' | 'L2' | 'L3';

export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sukar';

export type QuestionFormat = 'PG' | 'PGK_JAMAK' | 'PGK_KATEGORI';

export interface IndicatorBlueprint {
  id: string;
  tujuanPembelajaran: string;
  materi: string;
  indikatorSoal: string;
  levelKognitif: CognitiveLevel;
  tingkatKesulitan: DifficultyLevel;
  bentukSoal: QuestionFormat;
  jumlahButir: number;
}

export interface QuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface PgkCategoryStatement {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TkaQuestion {
  id: string;
  nomor: number;
  bentukSoal: QuestionFormat;
  tujuanPembelajaran: string;
  materi: string;
  indikatorSoal: string;
  levelKognitif: CognitiveLevel;
  tingkatKesulitan: DifficultyLevel;
  stimulus?: string;
  pertanyaan: string;
  opsi: QuestionOption[];
  pernyataanKategori?: PgkCategoryStatement[];
  kunciJawaban: string;
  pembahasan: string;
}

export interface ExamMetadata {
  judulUjian: string;
  mataPelajaran: string;
  kelas: string;
  durasiMenit: number;
  guruPenyusun: string;
}

export type ThemePresetId =
  | 'emerald-man1'
  | 'navy-akademik'
  | 'maroon-madrasah'
  | 'slate-cendekia'
  | 'custom';

export interface SchoolThemeConfig {
  presetId: ThemePresetId;
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  schoolName: string;
  schoolSubtitle: string;
  academicYear: string;
  customLogoDataUrl: string | null;
}

export const COGNITIVE_LABELS: Record<CognitiveLevel, string> = {
  L1: 'L1 · Pengetahuan & Pemahaman (C1–C2)',
  L2: 'L2 · Aplikasi & Penerapan (C3)',
  L3: 'L3 · Penalaran & HOTS (C4–C6)',
};

export const FORMAT_LABELS: Record<QuestionFormat, string> = {
  PG: 'Pilihan Ganda (5 Opsi A–E)',
  PGK_JAMAK: 'Pilihan Ganda Kompleks (Jawaban Jamak)',
  PGK_KATEGORI: 'Pilihan Ganda Kompleks (Kategori Benar/Salah)',
};
