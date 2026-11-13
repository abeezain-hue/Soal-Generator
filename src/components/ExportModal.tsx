import React, { useState } from 'react';
import {
  Check,
  Copy,
  FileCode2,
  FileDown,
  FileText,
  GraduationCap,
  Loader2,
  Send,
  X,
} from 'lucide-react';
import { ExamMetadata, SchoolThemeConfig, TkaQuestion } from '../types/tka';
import {
  generateClassroomCopyText,
  generateMoodleXml,
  generateWordDocHtml,
} from '../utils/exporters';
import { downloadTkaPdf } from '../utils/pdfExporter';

interface ExportModalProps {
  isOpen: boolean;
  meta: ExamMetadata;
  theme: SchoolThemeConfig;
  questions: TkaQuestion[];
  onClose: () => void;
}

type ExportTab = 'files' | 'moodle' | 'classroom';

export function triggerFileDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  meta,
  theme,
  questions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('files');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeExplanation, setIncludeExplanation] = useState(true);

  // Moodle Direct API state
  const [moodleUrl, setMoodleUrl] = useState('');
  const [moodleToken, setMoodleToken] = useState('');
  const [moodleCategoryId, setMoodleCategoryId] = useState('');
  const [moodleWsFunction, setMoodleWsFunction] = useState('core_webservice_get_site_info');
  const [isPushingMoodle, setIsPushingMoodle] = useState(false);
  const [moodleResult, setMoodleResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Google Classroom Copy state
  const [copiedClassroom, setCopiedClassroom] = useState(false);
  const [classroomIncludeKeys, setClassroomIncludeKeys] = useState(false);

  if (!isOpen) return null;

  const baseName = `${meta.judulUjian || 'Soal_TKA'}_${meta.mataPelajaran || 'Mapel'}`
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .toLowerCase();

  const moodleXmlString = generateMoodleXml(meta, questions, includeAnswerKey && includeExplanation);

  const handleDownloadDoc = (withKey: boolean, withExplanation: boolean) => {
    const html = generateWordDocHtml(meta, theme, questions, {
      includeAnswerKey: withKey,
      includeExplanation: withExplanation,
    });
    triggerFileDownload(
      `${baseName}${withKey ? '_guru' : '_siswa'}.doc`,
      html,
      'application/msword;charset=utf-8'
    );
  };

  const handleDownloadXml = () => {
    triggerFileDownload(`${baseName}_moodle.xml`, moodleXmlString, 'application/xml;charset=utf-8');
  };

  const handleDownloadPdf = (withKey: boolean, withExplanation: boolean) => {
    downloadTkaPdf(meta, theme, questions, {
      includeAnswerKey: withKey,
      includeExplanation: withExplanation,
    });
  };

  const handleMoodleDirectPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPushingMoodle(true);
    setMoodleResult(null);
    try {
      const res = await fetch('/api/export/moodle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodleUrl,
          token: moodleToken,
          categoryId: moodleCategoryId,
          wsFunction: moodleWsFunction,
          xmlContent: moodleXmlString,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMoodleResult({ ok: false, message: data.error || 'Gagal terhubung ke Moodle.' });
      } else {
        setMoodleResult({ ok: true, message: data.message || 'Permintaan Moodle berhasil.' });
      }
    } catch {
      setMoodleResult({
        ok: false,
        message: 'Gagal menghubungi server backend untuk koneksi Moodle.',
      });
    } finally {
      setIsPushingMoodle(false);
    }
  };

  const handleCopyClassroom = async () => {
    const text = generateClassroomCopyText(meta, questions, classroomIncludeKeys);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedClassroom(true);
      setTimeout(() => setCopiedClassroom(false), 2500);
    } catch {
      // Fallback textarea copy
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopiedClassroom(true);
      setTimeout(() => setCopiedClassroom(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2
              id="export-modal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Ekspor Naskah &amp; Integrasi LMS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {questions.length} butir soal TKA siap diekspor ke DOC, Moodle XML, PDF, atau LMS.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela ekspor"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          {[
            { id: 'files', label: 'Dokumen (DOC / XML / PDF)' },
            { id: 'moodle', label: 'Moodle LMS' },
            { id: 'classroom', label: 'Google Classroom' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ExportTab)}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                style={
                  active
                    ? {
                        borderColor:
                          theme.mode === 'dark' ? '#f8fafc' : 'var(--brand-primary)',
                        color: theme.mode === 'dark' ? '#f8fafc' : 'var(--brand-primary)',
                      }
                    : undefined
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {questions.length === 0 ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Belum ada soal untuk diekspor. Silakan buat soal TKA atau muat paket contoh terlebih
              dahulu.
            </div>
          ) : (
            <>
              {activeTab === 'files' && (
                <div className="space-y-5">
                  {/* Opsi Kunci & Pembahasan */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Opsi Lampiran Kunci &amp; Pembahasan
                    </p>
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAnswerKey}
                        onChange={(e) => {
                          setIncludeAnswerKey(e.target.checked);
                          if (!e.target.checked) setIncludeExplanation(false);
                        }}
                        className="rounded border-slate-300"
                      />
                      <span>Sertakan halaman Kunci Jawaban (Pegangan Guru)</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeExplanation}
                        disabled={!includeAnswerKey}
                        onChange={(e) => setIncludeExplanation(e.target.checked)}
                        className="rounded border-slate-300 disabled:opacity-40"
                      />
                      <span>Sertakan Pembahasan Otomatis langkah demi langkah</span>
                    </label>
                  </div>

                  {/* Format Download Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                          <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />
                          <span>Microsoft Word (.doc)</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          Naskah siap sunting lengkap dengan Kop Resmi {theme.schoolName}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(includeAnswerKey, includeExplanation)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white cursor-pointer"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        Unduh DOC
                      </button>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                          <FileCode2 className="w-4 h-4 text-amber-600" aria-hidden="true" />
                          <span>Moodle XML (.xml)</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          Format Quiz XML standar untuk impor langsung ke Bank Soal Moodle.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadXml}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white cursor-pointer"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        Unduh XML
                      </button>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                          <FileDown className="w-4 h-4 text-rose-600" aria-hidden="true" />
                          <span>Dokumen PDF (.pdf)</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          Naskah A4 siap cetak atau dibagikan secara digital ke siswa.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(includeAnswerKey, includeExplanation)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white cursor-pointer"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        Unduh PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'moodle' && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Metode 1: Paket Moodle XML Siap Impor (Direkomendasikan)
                      </h3>
                      <button
                        type="button"
                        onClick={handleDownloadXml}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        <FileCode2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Unduh Moodle XML</span>
                      </button>
                    </div>
                    <ol className="text-xs text-slate-600 dark:text-slate-400 list-decimal pl-4 space-y-1">
                      <li>Unduh file Moodle XML di atas (sudah mencakup PG, PGK Jamak, &amp; PGK Matching Benar/Salah + feedback pembahasan).</li>
                      <li>Buka Kursus di Moodle E-Learning MAN 1 Jember → menu <strong>Question Bank → Import</strong>.</li>
                      <li>Pilih format <strong>Moodle XML format</strong> lalu unggah file XML tersebut.</li>
                    </ol>
                  </div>

                  {/* Direct Moodle Web Services Push */}
                  <form
                    onSubmit={handleMoodleDirectPush}
                    className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Metode 2: Koneksi Langsung Moodle Web Services REST API
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="moodle-url"
                          className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                        >
                          URL Situs Moodle
                        </label>
                        <input
                          id="moodle-url"
                          type="url"
                          required
                          value={moodleUrl}
                          onChange={(e) => setMoodleUrl(e.target.value)}
                          placeholder="https://elearning.man1jember.sch.id"
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="moodle-token"
                          className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Token Web Service Moodle
                        </label>
                        <input
                          id="moodle-token"
                          type="password"
                          required
                          value={moodleToken}
                          onChange={(e) => setMoodleToken(e.target.value)}
                          placeholder="Token wstoken"
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="moodle-wsfn"
                          className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Fungsi Web Service (`wsfunction`)
                        </label>
                        <input
                          id="moodle-wsfn"
                          type="text"
                          value={moodleWsFunction}
                          onChange={(e) => setMoodleWsFunction(e.target.value)}
                          className="w-full font-mono-tabular rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="moodle-cat"
                          className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                        >
                          ID Kategori Soal (Opsional)
                        </label>
                        <input
                          id="moodle-cat"
                          type="text"
                          value={moodleCategoryId}
                          onChange={(e) => setMoodleCategoryId(e.target.value)}
                          placeholder="Mis. 12"
                          className="w-full font-mono-tabular rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {moodleResult && (
                      <div
                        role="status"
                        className={`rounded-lg p-3 text-xs ${
                          moodleResult.ok
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900'
                        }`}
                      >
                        {moodleResult.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPushingMoodle}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                      {isPushingMoodle ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>Kirim / Uji Koneksi ke Moodle</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'classroom' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                      <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                      <span>Paket Siap Posting ke Google Classroom</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Sinkronisasi API otomatis ke akun Google Classroom dinonaktifkan atas pilihan
                      Anda. Gunakan paket siap tempel dan lampiran PDF/DOC khusus siswa di bawah
                      ini untuk dibagikan langsung ke kelas di Google Classroom.
                    </p>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={classroomIncludeKeys}
                          onChange={(e) => setClassroomIncludeKeys(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span>Sertakan kunci &amp; pembahasan pada teks salinan</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyClassroom}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        {copiedClassroom ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Tersalin ke Papan Klip</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Salin Teks Tugas Classroom</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(false, false)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Unduh Lampiran Siswa (.pdf)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(false, false)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Unduh Lampiran Siswa (.doc)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(true, true)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Unduh Pegangan Guru (.pdf)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
