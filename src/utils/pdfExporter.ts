import { jsPDF } from 'jspdf';
import { ExamMetadata, SchoolThemeConfig, TkaQuestion } from '../types/tka';

export interface PdfExportOptions {
  includeAnswerKey: boolean;
  includeExplanation: boolean;
}

export function downloadTkaPdf(
  meta: ExamMetadata,
  theme: SchoolThemeConfig,
  questions: TkaQuestion[],
  options: PdfExportOptions
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const maxWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }
  };

  // Kop Madrasah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(14);
  doc.setTextColor(theme.primaryColor);
  doc.text(theme.schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(theme.schoolSubtitle, pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setDrawColor(theme.primaryColor);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Metadata ringkas
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, maxWidth, 18, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, maxWidth, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Asesmen: ${meta.judulUjian}`, margin + 3, y + 6);
  doc.text(`Tahun Ajaran: ${theme.academicYear}`, pageWidth / 2 + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mata Pelajaran: ${meta.mataPelajaran}`, margin + 3, y + 11);
  doc.text(`Kelas / Waktu: ${meta.kelas} · ${meta.durasiMenit} Menit`, pageWidth / 2 + 4, y + 11);
  doc.text(`Penyusun: ${meta.guruPenyusun || 'Tim Guru MAN 1 Jember'}`, margin + 3, y + 16);
  doc.text(`Total Butir: ${questions.length} Soal`, pageWidth / 2 + 4, y + 16);
  y += 25;

  // Daftar Soal
  questions.forEach((q) => {
    ensureSpace(26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const formatText =
      q.bentukSoal === 'PG'
        ? 'Pilihan Ganda'
        : q.bentukSoal === 'PGK_JAMAK'
          ? 'PG Kompleks (Jawaban Jamak)'
          : 'PG Kompleks (Benar/Salah)';
    doc.text(
      `Soal ${q.nomor} · ${q.materi} · ${q.levelKognitif} · ${q.tingkatKesulitan} · ${formatText}`,
      margin,
      y
    );
    y += 4.5;

    if (q.stimulus) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const stimLines = doc.splitTextToSize(`Stimulus: ${q.stimulus}`, maxWidth - 4);
      ensureSpace(stimLines.length * 4.5 + 4);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3, maxWidth, stimLines.length * 4.5 + 3, 'F');
      doc.text(stimLines, margin + 2, y + 1);
      y += stimLines.length * 4.5 + 4;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const stemLines = doc.splitTextToSize(`${q.nomor}. ${q.pertanyaan}`, maxWidth);
    ensureSpace(stemLines.length * 5 + 4);
    doc.text(stemLines, margin, y);
    y += stemLines.length * 5 + 2;

    if (q.bentukSoal === 'PGK_KATEGORI' && q.pernyataanKategori) {
      q.pernyataanKategori.forEach((stmt, idx) => {
        const sLines = doc.splitTextToSize(`(${idx + 1}) ${stmt.text}   [ Benar / Salah ]`, maxWidth - 6);
        ensureSpace(sLines.length * 4.8 + 2);
        doc.setFontSize(9.8);
        doc.text(sLines, margin + 4, y);
        y += sLines.length * 4.8 + 1.5;
      });
    } else {
      q.opsi.forEach((opt) => {
        const prefix = q.bentukSoal === 'PGK_JAMAK' ? `[ ] ${opt.label}. ` : `${opt.label}. `;
        const oLines = doc.splitTextToSize(`${prefix}${opt.text}`, maxWidth - 6);
        ensureSpace(oLines.length * 4.8 + 2);
        doc.setFontSize(10);
        doc.text(oLines, margin + 4, y);
        y += oLines.length * 4.8 + 1.5;
      });
    }

    y += 4;
  });

  // Lampiran Kunci Jawaban & Pembahasan
  if (options.includeAnswerKey) {
    doc.addPage();
    y = 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(theme.primaryColor);
    doc.text('KUNCI JAWABAN & PEMBAHASAN OTOMATIS', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${meta.judulUjian} — ${meta.mataPelajaran} (${meta.kelas})`, margin, y);
    y += 7;

    questions.forEach((q) => {
      ensureSpace(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`No. ${q.nomor} — Kunci: ${q.kunciJawaban}`, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const indLines = doc.splitTextToSize(`Indikator: ${q.indikatorSoal} (${q.levelKognitif} · ${q.tingkatKesulitan})`, maxWidth);
      ensureSpace(indLines.length * 4 + 2);
      doc.text(indLines, margin, y);
      y += indLines.length * 4 + 1.5;

      if (options.includeExplanation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const expLines = doc.splitTextToSize(`Pembahasan: ${q.pembahasan}`, maxWidth);
        ensureSpace(expLines.length * 4.5 + 3);
        doc.text(expLines, margin, y);
        y += expLines.length * 4.5 + 3;
      }

      y += 2;
    });
  }

  const safeFileName = `${meta.judulUjian || 'Soal_TKA'}_${meta.mataPelajaran || 'Mapel'}`
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .toLowerCase();
  doc.save(`${safeFileName}.pdf`);
}
