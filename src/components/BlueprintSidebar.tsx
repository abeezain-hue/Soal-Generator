import React from 'react';
import { Plus, Trash2, Sparkles, Loader2, BookOpen } from 'lucide-react';
import {
  COGNITIVE_LABELS,
  CognitiveLevel,
  DifficultyLevel,
  ExamMetadata,
  FORMAT_LABELS,
  IndicatorBlueprint,
  QuestionFormat,
} from '../types/tka';
import { TKA_PRESETS } from '../data/presets';

interface BlueprintSidebarProps {
  meta: ExamMetadata;
  onChangeMeta: (next: ExamMetadata) => void;
  draftBlueprint: IndicatorBlueprint;
  onChangeDraft: (next: IndicatorBlueprint) => void;
  queuedBlueprints: IndicatorBlueprint[];
  onAddBlueprintToQueue: () => void;
  onRemoveQueuedBlueprint: (id: string) => void;
  onApplyPreset: (presetId: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  validationErrors: string[];
  apiError: string | null;
}

export const BlueprintSidebar: React.FC<BlueprintSidebarProps> = ({
  meta,
  onChangeMeta,
  draftBlueprint,
  onChangeDraft,
  queuedBlueprints,
  onAddBlueprintToQueue,
  onRemoveQueuedBlueprint,
  onApplyPreset,
  onGenerate,
  isGenerating,
  validationErrors,
  apiError,
}) => {
  const activeCount =
    queuedBlueprints.length > 0
      ? queuedBlueprints.reduce((acc, item) => acc + item.jumlahButir, 0)
      : draftBlueprint.jumlahButir;

  return (
    <aside
      aria-label="Panel Penyusun Kisi-Kisi TKA"
      className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-6"
    >
      {/* Preset Kisi-Kisi Cepat */}
      <div className="space-y-2 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="preset-select"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Templat Kisi-Kisi MAN 1 Jember</span>
          </label>
        </div>
        <select
          id="preset-select"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              onApplyPreset(e.target.value);
              e.target.value = '';
            }
          }}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2"
          style={{ ['--tw-ring-color' as string]: 'var(--brand-primary)' }}
        >
          <option value="" disabled>
            Pilih contoh mata pelajaran &amp; kisi-kisi...
          </option>
          {TKA_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Identitas Naskah */}
      <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
          01. Identitas Naskah Asesmen
        </h2>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="judul-ujian"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Judul Asesmen / Ujian
            </label>
            <input
              id="judul-ujian"
              type="text"
              value={meta.judulUjian}
              onChange={(e) => onChangeMeta({ ...meta, judulUjian: e.target.value })}
              placeholder="Contoh: Asesmen Tes Kemampuan Akademik (TKA)"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="mata-pelajaran"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Mata Pelajaran
              </label>
              <input
                id="mata-pelajaran"
                type="text"
                value={meta.mataPelajaran}
                onChange={(e) => onChangeMeta({ ...meta, mataPelajaran: e.target.value })}
                placeholder="Matematika Wajib"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="kelas-jenjang"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Kelas / Fase
              </label>
              <input
                id="kelas-jenjang"
                type="text"
                value={meta.kelas}
                onChange={(e) => onChangeMeta({ ...meta, kelas: e.target.value })}
                placeholder="XII MA"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="guru-penyusun"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Guru Penyusun
              </label>
              <input
                id="guru-penyusun"
                type="text"
                value={meta.guruPenyusun}
                onChange={(e) => onChangeMeta({ ...meta, guruPenyusun: e.target.value })}
                placeholder="Nama Guru / MGMP"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="durasi-menit"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Alokasi Waktu (Menit)
              </label>
              <input
                id="durasi-menit"
                type="number"
                min={10}
                max={240}
                value={meta.durasiMenit}
                onChange={(e) =>
                  onChangeMeta({ ...meta, durasiMenit: Math.max(10, Number(e.target.value) || 60) })
                }
                className="w-full font-mono-tabular rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Kisi-Kisi Soal TKA */}
      <div className="space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
          02. Parameter Kisi-Kisi &amp; Butir Soal
        </h2>

        <div>
          <label
            htmlFor="tujuan-pembelajaran"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
          >
            Tujuan Pembelajaran (TP)
          </label>
          <textarea
            id="tujuan-pembelajaran"
            rows={3}
            value={draftBlueprint.tujuanPembelajaran}
            onChange={(e) =>
              onChangeDraft({ ...draftBlueprint, tujuanPembelajaran: e.target.value })
            }
            placeholder="Contoh: Peserta didik mampu menganalisis aturan pencacahan dan peluang kejadian majemuk..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="materi-sub"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
          >
            Materi / Sub-Materi
          </label>
          <input
            id="materi-sub"
            type="text"
            value={draftBlueprint.materi}
            onChange={(e) => onChangeDraft({ ...draftBlueprint, materi: e.target.value })}
            placeholder="Contoh: Peluang & Kaidah Pencacahan"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="indikator-soal"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
          >
            Indikator Soal
          </label>
          <textarea
            id="indikator-soal"
            rows={3}
            value={draftBlueprint.indikatorSoal}
            onChange={(e) =>
              onChangeDraft({ ...draftBlueprint, indikatorSoal: e.target.value })
            }
            placeholder="Contoh: Disajikan konteks pemilihan tim madrasah, siswa menentukan peluang..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="level-kognitif"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Level Kognitif
            </label>
            <select
              id="level-kognitif"
              value={draftBlueprint.levelKognitif}
              onChange={(e) =>
                onChangeDraft({
                  ...draftBlueprint,
                  levelKognitif: e.target.value as CognitiveLevel,
                })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
            >
              {(Object.keys(COGNITIVE_LABELS) as CognitiveLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {COGNITIVE_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tingkat-kesulitan"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Tingkat Kesulitan
            </label>
            <select
              id="tingkat-kesulitan"
              value={draftBlueprint.tingkatKesulitan}
              onChange={(e) =>
                onChangeDraft({
                  ...draftBlueprint,
                  tingkatKesulitan: e.target.value as DifficultyLevel,
                })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
            >
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sukar">Sukar</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="bentuk-soal"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
          >
            Bentuk Soal
          </label>
          <select
            id="bentuk-soal"
            value={draftBlueprint.bentukSoal}
            onChange={(e) =>
              onChangeDraft({
                ...draftBlueprint,
                bentukSoal: e.target.value as QuestionFormat,
              })
            }
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2"
          >
            {(Object.keys(FORMAT_LABELS) as QuestionFormat[]).map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            <label
              htmlFor="jumlah-butir"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
            >
              Jumlah Butir Soal (1–20)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Kurangi jumlah butir soal"
                onClick={() =>
                  onChangeDraft({
                    ...draftBlueprint,
                    jumlahButir: Math.max(1, draftBlueprint.jumlahButir - 1),
                  })
                }
                className="h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                -
              </button>
              <input
                id="jumlah-butir"
                type="number"
                min={1}
                max={20}
                value={draftBlueprint.jumlahButir}
                onChange={(e) =>
                  onChangeDraft({
                    ...draftBlueprint,
                    jumlahButir: Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
                className="w-20 h-10 text-center font-mono-tabular font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                aria-label="Tambah jumlah butir soal"
                onClick={() =>
                  onChangeDraft({
                    ...draftBlueprint,
                    jumlahButir: Math.min(20, draftBlueprint.jumlahButir + 1),
                  })
                }
                className="h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddBlueprintToQueue}
            className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah ke Antrean</span>
          </button>
        </div>

        {/* Antrean Multi-Indikator */}
        {queuedBlueprints.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Antrean Kisi-Kisi ({queuedBlueprints.length} indikator)
              </span>
              <span className="font-mono-tabular">Total {activeCount} butir</span>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950">
              {queuedBlueprints.map((bp, idx) => (
                <li key={bp.id} className="p-2.5 flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {idx + 1}. {bp.materi}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {bp.levelKognitif} · {bp.tingkatKesulitan} ·{' '}
                      {bp.bentukSoal === 'PG'
                        ? 'PG'
                        : bp.bentukSoal === 'PGK_JAMAK'
                          ? 'PGK Jamak'
                          : 'PGK B/S'}{' '}
                      · <span className="font-mono-tabular">{bp.jumlahButir} butir</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus kisi-kisi ${bp.materi}`}
                    onClick={() => onRemoveQueuedBlueprint(bp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation & API Errors */}
        {validationErrors.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 space-y-1"
          >
            {validationErrors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-200"
          >
            {apiError}
          </div>
        )}

        {/* Primary Generate CTA */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-4 rounded-lg text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Menyusun {activeCount} Soal TKA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Buat {activeCount} Butir Soal TKA</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
