import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  FileCode2,
  FileDown,
  FileText,
  Printer,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  CognitiveLevel,
  ExamMetadata,
  QuestionFormat,
  SchoolThemeConfig,
  TkaQuestion,
} from '../types/tka';
import { SchoolEmblem } from './Header';

interface QuestionStageProps {
  meta: ExamMetadata;
  theme: SchoolThemeConfig;
  questions: TkaQuestion[];
  isGenerating: boolean;
  teacherMode: boolean;
  onToggleTeacherMode: (isTeacher: boolean) => void;
  onUpdateQuestion: (updated: TkaQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onClearQuestions: () => void;
  onLoadSamplePack: () => void;
  onQuickExportDoc: () => void;
  onQuickExportXml: () => void;
  onQuickExportPdf: () => void;
}

export const QuestionStage: React.FC<QuestionStageProps> = ({
  meta,
  theme,
  questions,
  isGenerating,
  teacherMode,
  onToggleTeacherMode,
  onUpdateQuestion,
  onDeleteQuestion,
  onClearQuestions,
  onLoadSamplePack,
  onQuickExportDoc,
  onQuickExportXml,
  onQuickExportPdf,
}) => {
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'PG' | 'PGK'>('ALL');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CognitiveLevel>('ALL');
  const [collapsedExplanations, setCollapsedExplanations] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<TkaQuestion | null>(null);

  const filteredQuestions = questions.filter((q) => {
    if (formatFilter === 'PG' && q.bentukSoal !== 'PG') return false;
    if (formatFilter === 'PGK' && q.bentukSoal === 'PG') return false;
    if (levelFilter !== 'ALL' && q.levelKognitif !== levelFilter) return false;
    return true;
  });

  const toggleExplanation = (id: string) => {
    setCollapsedExplanations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEdit = (q: TkaQuestion) => {
    setEditingId(q.id);
    setEditDraft(JSON.parse(JSON.stringify(q)) as TkaQuestion);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = () => {
    if (editDraft) {
      onUpdateQuestion(editDraft);
      setEditingId(null);
      setEditDraft(null);
    }
  };

  const formatShortLabel = (fmt: QuestionFormat) => {
    if (fmt === 'PG') return 'Pilihan Ganda';
    if (fmt === 'PGK_JAMAK') return 'PG Kompleks (Jamak)';
    return 'PG Kompleks (Benar/Salah)';
  };

  return (
    <section aria-label="Pratinjau Naskah Soal TKA" className="space-y-4 min-w-0">
      {/* Workspace Toolbar */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Teacher vs Student Mode Segmented Control */}
          <div
            role="group"
            aria-label="Mode Tampilan Naskah"
            className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
          >
            <button
              type="button"
              onClick={() => onToggleTeacherMode(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                teacherMode
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mode Guru</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleTeacherMode(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !teacherMode
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mode Siswa</span>
            </button>
          </div>

          {/* Filter by Format */}
          <select
            aria-label="Filter bentuk soal"
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as 'ALL' | 'PG' | 'PGK')}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Semua Bentuk ({questions.length})</option>
            <option value="PG">Pilihan Ganda</option>
            <option value="PGK">PG Kompleks</option>
          </select>

          {/* Filter by Cognitive Level */}
          <select
            aria-label="Filter level kognitif"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as 'ALL' | CognitiveLevel)}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Semua Level</option>
            <option value="L1">L1 (Pemahaman)</option>
            <option value="L2">L2 (Aplikasi)</option>
            <option value="L3">L3 (Penalaran HOTS)</option>
          </select>
        </div>

        {/* Quick Export & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onQuickExportDoc}
            disabled={questions.length === 0}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>DOC</span>
          </button>
          <button
            type="button"
            onClick={onQuickExportXml}
            disabled={questions.length === 0}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Moodle XML</span>
          </button>
          <button
            type="button"
            onClick={onQuickExportPdf}
            disabled={questions.length === 0}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={questions.length === 0}
            aria-label="Cetak Naskah"
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cetak</span>
          </button>
          {questions.length > 0 && (
            <button
              type="button"
              onClick={onClearQuestions}
              aria-label="Kosongkan daftar soal"
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Sheet */}
      <div className="print-sheet bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {/* Official School Kop Header */}
        <div
          className="px-6 py-5 border-b-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderBottomColor: theme.primaryColor }}
        >
          <div className="flex items-center gap-4">
            <SchoolEmblem
              logoUrl={theme.customLogoDataUrl}
              schoolName={theme.schoolName}
              sizeClass="h-14 w-14"
            />
            <div>
              <p
                className="text-xs font-semibold tracking-wide"
                style={{ color: theme.accentColor }}
              >
                Kementerian Agama Republik Indonesia
              </p>
              <h1
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: theme.mode === 'dark' ? '#f8fafc' : theme.primaryColor }}
              >
                {theme.schoolName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {theme.schoolSubtitle}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{meta.judulUjian}</p>
            <p>
              {meta.mataPelajaran || 'Mata Pelajaran'} · {meta.kelas || 'Kelas'}
            </p>
            <p className="font-mono-tabular text-slate-500 dark:text-slate-400">
              Tahun Ajaran {theme.academicYear} · {meta.durasiMenit} Menit · {questions.length}{' '}
              Butir
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="p-6 space-y-6" aria-busy="true" aria-label="Membuat soal TKA">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="pb-6 border-b border-slate-200 dark:border-slate-800 last:border-b-0 space-y-3 animate-pulse"
              >
                <div className="h-3.5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-14 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="h-3.5 w-3/5 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && questions.length === 0 && (
          <div className="px-6 py-16 text-center max-w-lg mx-auto space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Belum Ada Butir Soal TKA pada Naskah
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Lengkapi tujuan pembelajaran, materi, indikator soal, level kognitif, dan bentuk
              soal di panel kiri lalu klik tombol buat soal, atau muat paket contoh standar MAN 1
              Jember untuk langsung meninjau format ekspor.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onLoadSamplePack}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Muat Paket Contoh Matematika TKA
              </button>
            </div>
          </div>
        )}

        {/* Populated Question List */}
        {!isGenerating && questions.length > 0 && filteredQuestions.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Tidak ada soal yang cocok dengan filter bentuk/level kognitif yang dipilih.
          </div>
        )}

        {!isGenerating && filteredQuestions.length > 0 && (
          <div className="divide-y divide-slate-200 dark:divide-slate-800" data-testid="question-list">
            {filteredQuestions.map((q) => {
              const isEditing = editingId === q.id && editDraft;
              const isExplanationHidden = collapsedExplanations[q.id];

              return (
                <article
                  key={q.id}
                  data-testid="question-card"
                  className="p-6 space-y-4 transition-colors"
                >
                  {/* Unboxed Metadata Line (Zero-Pill Rule) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className="font-mono-tabular font-semibold"
                        style={{ color: theme.mode === 'dark' ? '#e2e8f0' : theme.primaryColor }}
                      >
                        Soal {String(q.nomor).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {q.materi}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{q.levelKognitif}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.tingkatKesulitan}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatShortLabel(q.bentukSoal)}</span>
                    </div>

                    <div className="no-print flex items-center gap-1">
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(q)}
                            aria-label={`Sunting soal nomor ${q.nomor}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteQuestion(q.id)}
                            aria-label={`Hapus soal nomor ${q.nomor}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                          >
                            <Save className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Batal</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Indikator Ringkas */}
                  {teacherMode && !isEditing && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Indikator:
                      </span>{' '}
                      {q.indikatorSoal}
                    </p>
                  )}

                  {/* Editing Mode */}
                  {isEditing ? (
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Stimulus / Wacana (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          value={editDraft.stimulus || ''}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, stimulus: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Pertanyaan
                        </label>
                        <textarea
                          rows={2}
                          value={editDraft.pertanyaan}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, pertanyaan: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Kunci Jawaban
                        </label>
                        <input
                          type="text"
                          value={editDraft.kunciJawaban}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, kunciJawaban: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Pembahasan Otomatis
                        </label>
                        <textarea
                          rows={3}
                          value={editDraft.pembahasan}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, pembahasan: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Stimulus Box (Hairline border, no thick left bar) */}
                      {q.stimulus && (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Stimulus Soal
                          </p>
                          <p className="whitespace-pre-line">{q.stimulus}</p>
                        </div>
                      )}

                      {/* Question Stem */}
                      <p className="text-[15px] leading-relaxed font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line">
                        {q.pertanyaan}
                      </p>

                      {/* Options / Statements */}
                      {q.bentukSoal === 'PGK_KATEGORI' && q.pernyataanKategori ? (
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <th className="py-2.5 px-3 text-center w-12">No</th>
                                <th className="py-2.5 px-3 text-left">Pernyataan</th>
                                <th className="py-2.5 px-3 text-center w-24">Benar</th>
                                <th className="py-2.5 px-3 text-center w-24">Salah</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {q.pernyataanKategori.map((stmt, idx) => (
                                <tr key={stmt.id} className="text-slate-800 dark:text-slate-200">
                                  <td className="py-2.5 px-3 text-center font-mono-tabular text-xs text-slate-500">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2.5 px-3">{stmt.text}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    {teacherMode && stmt.isCorrect ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                        <Check className="w-4 h-4" aria-hidden="true" />
                                        Benar
                                      </span>
                                    ) : (
                                      <span className="inline-block w-4 h-4 rounded border border-slate-300 dark:border-slate-700" />
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {teacherMode && !stmt.isCorrect ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                        <Check className="w-4 h-4" aria-hidden="true" />
                                        Salah
                                      </span>
                                    ) : (
                                      <span className="inline-block w-4 h-4 rounded border border-slate-300 dark:border-slate-700" />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {q.opsi.map((opt) => {
                            const highlight = teacherMode && opt.isCorrect;
                            return (
                              <li
                                key={opt.label}
                                className={`flex items-start gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-colors ${
                                  highlight
                                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 font-medium'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <span className="font-mono-tabular font-semibold shrink-0 w-6">
                                  {q.bentukSoal === 'PGK_JAMAK' ? `[${opt.label}]` : `${opt.label}.`}
                                </span>
                                <span className="flex-1 leading-relaxed">{opt.text}</span>
                                {highlight && (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                    Kunci
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Kunci Jawaban & Pembahasan Otomatis (Mode Guru) */}
                      {teacherMode && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleExplanation(q.id)}
                            aria-expanded={!isExplanationHidden}
                            className="no-print text-xs font-semibold inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          >
                            {isExplanationHidden ? (
                              <ChevronDown className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <ChevronUp className="w-4 h-4" aria-hidden="true" />
                            )}
                            <span>
                              Kunci Jawaban: {q.kunciJawaban} —{' '}
                              {isExplanationHidden ? 'Tampilkan Pembahasan' : 'Sembunyikan Pembahasan'}
                            </span>
                          </button>

                          {!isExplanationHidden && (
                            <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                Pembahasan Otomatis · Kunci: {q.kunciJawaban}
                              </p>
                              <p className="leading-relaxed whitespace-pre-line">{q.pembahasan}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
