import React from 'react';
import { X } from 'lucide-react';

interface TkaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TkaGuideModal: React.FC<TkaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <h2
            id="guide-modal-title"
            className="font-display text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Panduan Penyusunan Soal Standar TKA
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan TKA"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100">
              1. Klasifikasi Level Kognitif TKA
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                <strong>L1 (Pengetahuan &amp; Pemahaman · C1–C2):</strong> Mengukur penguasaan
                fakta, konsep dasar, definisi, dan prosedur langsung.
              </li>
              <li>
                <strong>L2 (Aplikasi · C3):</strong> Menuntut penerapan konsep atau rumus pada
                kasus kontekstual baru.
              </li>
              <li>
                <strong>L3 (Penalaran &amp; HOTS · C4–C6):</strong> Mengukur kemampuan analisis,
                evaluasi argumen, inferensi stimulus, serta sintesis pemecahan masalah.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100">
              2. Bentuk Soal yang Didukung
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                <strong>Pilihan Ganda (PG):</strong> 5 opsi jawaban (A–E) dengan 1 kunci jawaban
                paling tepat dan 4 pengecoh homogen.
              </li>
              <li>
                <strong>PG Kompleks Jawaban Jamak:</strong> Peserta didik memilih lebih dari satu
                pernyataan atau opsi yang benar (mendukung penilaian parsial Moodle XML).
              </li>
              <li>
                <strong>PG Kompleks Kategori (Benar/Salah):</strong> Peserta didik menentukan
                kebenaran serangkaian pernyataan berbasis stimulus, diekspor sebagai tabel di
                DOC/PDF dan tipe <em>matching</em> di Moodle XML.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100">
              3. Alur Kerja Guru MAN 1 Jember
            </h3>
            <p className="text-xs sm:text-sm">
              Susun satu atau beberapa indikator pada panel kiri, hasilkan butir soal beserta kunci
              jawaban dan pembahasan otomatis, tinjau atau sunting naskah di kanvas kanan, lalu
              ekspor ke DOC, PDF, atau Moodle XML.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
