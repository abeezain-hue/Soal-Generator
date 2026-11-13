import {
  ExamMetadata,
  IndicatorBlueprint,
  SchoolThemeConfig,
  TkaQuestion,
} from '../types/tka';

export function escapeXml(unsafe: string): string {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function escapeHtml(unsafe: string): string {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renumberQuestions(questions: TkaQuestion[]): TkaQuestion[] {
  return questions.map((q, idx) => ({
    ...q,
    nomor: idx + 1,
  }));
}

export interface BlueprintValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBlueprintForm(
  meta: Pick<ExamMetadata, 'mataPelajaran' | 'kelas'>,
  blueprints: IndicatorBlueprint[]
): BlueprintValidationResult {
  const errors: string[] = [];
  if (!meta.mataPelajaran.trim()) {
    errors.push('Mata pelajaran wajib diisi.');
  }
  if (!meta.kelas.trim()) {
    errors.push('Kelas / jenjang wajib diisi.');
  }
  if (blueprints.length === 0) {
    errors.push('Minimal harus ada 1 kisi-kisi indikator soal.');
    return { valid: false, errors };
  }

  let totalItems = 0;
  blueprints.forEach((bp, index) => {
    const label = blueprints.length > 1 ? `Kisi-kisi #${index + 1}` : 'Kisi-kisi';
    if (!bp.tujuanPembelajaran.trim()) {
      errors.push(`${label}: Tujuan Pembelajaran wajib diisi.`);
    }
    if (!bp.materi.trim()) {
      errors.push(`${label}: Materi / Sub-materi wajib diisi.`);
    }
    if (!bp.indikatorSoal.trim()) {
      errors.push(`${label}: Indikator Soal wajib diisi.`);
    }
    if (!Number.isInteger(bp.jumlahButir) || bp.jumlahButir < 1 || bp.jumlahButir > 30) {
      errors.push(`${label}: Jumlah butir soal harus antara 1 sampai 30.`);
    }
    totalItems += bp.jumlahButir;
  });

  if (totalItems > 30) {
    errors.push(`Total seluruh butir soal (${totalItems}) melebihi batas maksimum 30 soal per sesi generate.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates standard Moodle Quiz XML compatible with Moodle Question Bank Import.
 * - PG: multichoice (single=true)
 * - PGK_JAMAK: multichoice (single=false) with proportional positive/negative fractions
 * - PGK_KATEGORI: matching question mapping each statement to Benar / Salah
 */
export function generateMoodleXml(
  meta: ExamMetadata,
  questions: TkaQuestion[],
  includeFeedback = true
): string {
  const categoryPath = `$course$/TKA-${meta.mataPelajaran.trim() || 'Umum'}-${meta.kelas.trim() || 'MA'}`;

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<quiz>',
    '  <question type="category">',
    '    <category>',
    `      <text>${escapeXml(categoryPath)}</text>`,
    '    </category>',
    '  </question>',
  ];

  questions.forEach((q) => {
    const qNumber = String(q.nomor).padStart(2, '0');
    const qTitle = `Soal ${qNumber} [${q.levelKognitif} · ${q.tingkatKesulitan}] - ${q.materi}`;
    const stemHtml = [
      q.stimulus ? `<p><em>Konteks / Stimulus:</em><br/>${escapeHtml(q.stimulus).replace(/\n/g, '<br/>')}</p>` : '',
      `<p>${escapeHtml(q.pertanyaan).replace(/\n/g, '<br/>')}</p>`,
    ]
      .filter(Boolean)
      .join('');

    const feedbackHtml = includeFeedback
      ? `<p><strong>Kunci Jawaban:</strong> ${escapeHtml(q.kunciJawaban)}</p><p><strong>Pembahasan:</strong><br/>${escapeHtml(q.pembahasan).replace(/\n/g, '<br/>')}</p>`
      : '';

    if (q.bentukSoal === 'PGK_KATEGORI' && q.pernyataanKategori && q.pernyataanKategori.length > 0) {
      lines.push('  <question type="matching">');
      lines.push('    <name>');
      lines.push(`      <text>${escapeXml(qTitle)}</text>`);
      lines.push('    </name>');
      lines.push('    <questiontext format="html">');
      lines.push(`      <text><![CDATA[${stemHtml}<p><em>Tentukan Benar atau Salah untuk setiap pernyataan berikut:</em></p>]]></text>`);
      lines.push('    </questiontext>');
      lines.push('    <generalfeedback format="html">');
      lines.push(`      <text><![CDATA[${feedbackHtml}]]></text>`);
      lines.push('    </generalfeedback>');
      lines.push('    <defaultgrade>1.0000000</defaultgrade>');
      lines.push('    <penalty>0.3333333</penalty>');
      lines.push('    <shuffleanswers>true</shuffleanswers>');

      q.pernyataanKategori.forEach((stmt) => {
        lines.push('    <subquestion format="html">');
        lines.push(`      <text><![CDATA[<p>${escapeHtml(stmt.text)}</p>]]></text>`);
        lines.push('      <answer>');
        lines.push(`        <text>${stmt.isCorrect ? 'Benar' : 'Salah'}</text>`);
        lines.push('      </answer>');
        lines.push('    </subquestion>');
      });

      lines.push('  </question>');
      return;
    }

    const isMultiple = q.bentukSoal === 'PGK_JAMAK';
    const correctCount = Math.max(1, q.opsi.filter((o) => o.isCorrect).length);
    const wrongCount = Math.max(1, q.opsi.filter((o) => !o.isCorrect).length);
    const positiveFraction = isMultiple ? formatMoodleFraction(100 / correctCount) : '100';
    const negativeFraction = isMultiple ? `-${formatMoodleFraction(100 / wrongCount)}` : '0';

    lines.push('  <question type="multichoice">');
    lines.push('    <name>');
    lines.push(`      <text>${escapeXml(qTitle)}</text>`);
    lines.push('    </name>');
    lines.push('    <questiontext format="html">');
    lines.push(`      <text><![CDATA[${stemHtml}]]></text>`);
    lines.push('    </questiontext>');
    lines.push('    <generalfeedback format="html">');
    lines.push(`      <text><![CDATA[${feedbackHtml}]]></text>`);
    lines.push('    </generalfeedback>');
    lines.push('    <defaultgrade>1.0000000</defaultgrade>');
    lines.push('    <penalty>0.3333333</penalty>');
    lines.push(`    <single>${isMultiple ? 'false' : 'true'}</single>`);
    lines.push('    <shuffleanswers>false</shuffleanswers>');
    lines.push('    <answernumbering>abc</answernumbering>');

    q.opsi.forEach((opt) => {
      const fraction = opt.isCorrect ? positiveFraction : negativeFraction;
      lines.push(`    <answer fraction="${fraction}" format="html">`);
      lines.push(`      <text><![CDATA[<p>${escapeHtml(opt.text)}</p>]]></text>`);
      lines.push('      <feedback format="html">');
      lines.push(
        `        <text>${opt.isCorrect ? 'Benar' : 'Kurang tepat'}</text>`
      );
      lines.push('      </feedback>');
      lines.push('    </answer>');
    });

    lines.push('  </question>');
  });

  lines.push('</quiz>');
  return lines.join('\n');
}

function formatMoodleFraction(val: number): string {
  if (Math.abs(val - 100) < 0.01) return '100';
  if (Math.abs(val - 50) < 0.01) return '50';
  if (Math.abs(val - 33.33333) < 0.05) return '33.33333';
  if (Math.abs(val - 25) < 0.01) return '25';
  if (Math.abs(val - 20) < 0.01) return '20';
  return val.toFixed(5);
}

export interface WordDocExportOptions {
  includeAnswerKey: boolean;
  includeExplanation: boolean;
}

export function generateWordDocHtml(
  meta: ExamMetadata,
  theme: SchoolThemeConfig,
  questions: TkaQuestion[],
  options: WordDocExportOptions
): string {
  const questionBlocks = questions
    .map((q) => {
      const stimulusHtml = q.stimulus
        ? `<div style="background:#f8fafc;border:1px solid #cbd5e1;padding:10px 12px;margin:8px 0;font-size:10.5pt;line-height:1.5;"><strong>Stimulus / Wacana:</strong><br/>${escapeHtml(q.stimulus).replace(/\n/g, '<br/>')}</div>`
        : '';

      let answersHtml = '';
      if (q.bentukSoal === 'PGK_KATEGORI' && q.pernyataanKategori) {
        const rows = q.pernyataanKategori
          .map(
            (stmt, i) => `
            <tr>
              <td style="border:1px solid #94a3b8;padding:6px 8px;width:30px;text-align:center;">${i + 1}</td>
              <td style="border:1px solid #94a3b8;padding:6px 8px;">${escapeHtml(stmt.text)}</td>
              <td style="border:1px solid #94a3b8;padding:6px 8px;width:65px;text-align:center;">[ &nbsp; ]</td>
              <td style="border:1px solid #94a3b8;padding:6px 8px;width:65px;text-align:center;">[ &nbsp; ]</td>
            </tr>`
          )
          .join('');
        answersHtml = `
          <table style="border-collapse:collapse;width:100%;margin-top:8px;font-size:10.5pt;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #94a3b8;padding:6px 8px;">No</th>
                <th style="border:1px solid #94a3b8;padding:6px 8px;text-align:left;">Pernyataan</th>
                <th style="border:1px solid #94a3b8;padding:6px 8px;">Benar</th>
                <th style="border:1px solid #94a3b8;padding:6px 8px;">Salah</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>`;
      } else {
        const prefixSymbol = q.bentukSoal === 'PGK_JAMAK' ? '[ &nbsp; ] ' : '';
        answersHtml = `<ol style="list-style-type:none;padding-left:0;margin:6px 0 0 0;">${q.opsi
          .map(
            (o) =>
              `<li style="margin:4px 0;"><strong>${prefixSymbol}${escapeHtml(o.label)}.</strong> ${escapeHtml(o.text)}</li>`
          )
          .join('')}</ol>`;
      }

      const formatTag =
        q.bentukSoal === 'PG'
          ? 'Pilihan Ganda'
          : q.bentukSoal === 'PGK_JAMAK'
            ? 'PG Kompleks (Jawaban Jamak)'
            : 'PG Kompleks (Benar/Salah)';

      return `
        <div style="margin-bottom:18px;page-break-inside:avoid;">
          <p style="margin:0 0 4px 0;font-size:9.5pt;color:#475569;">
            <strong>Soal ${q.nomor}</strong> · ${escapeHtml(q.materi)} · ${escapeHtml(q.levelKognitif)} · ${escapeHtml(q.tingkatKesulitan)} · ${formatTag}
          </p>
          ${stimulusHtml}
          <p style="margin:4px 0 6px 0;font-size:11pt;line-height:1.5;"><strong>${q.nomor}.</strong> ${escapeHtml(q.pertanyaan).replace(/\n/g, '<br/>')}</p>
          ${answersHtml}
        </div>`;
    })
    .join('\n');

  const keySection = options.includeAnswerKey
    ? `
      <br clear="all" style="page-break-before:always" />
      <h2 style="font-size:13pt;border-bottom:2px solid ${escapeHtml(theme.primaryColor)};padding-bottom:4px;color:${escapeHtml(theme.primaryColor)};">
        KUNCI JAWABAN &amp; PEMBAHASAN OTOMATIS
      </h2>
      <p style="font-size:10pt;color:#475569;">${escapeHtml(meta.judulUjian)} — ${escapeHtml(meta.mataPelajaran)} (${escapeHtml(meta.kelas)})</p>
      <table style="border-collapse:collapse;width:100%;font-size:10.5pt;margin-top:10px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #94a3b8;padding:6px 8px;width:45px;">No</th>
            <th style="border:1px solid #94a3b8;padding:6px 8px;width:130px;">Kunci Jawaban</th>
            <th style="border:1px solid #94a3b8;padding:6px 8px;text-align:left;">${options.includeExplanation ? 'Pembahasan & Indikator' : 'Indikator Soal'}</th>
          </tr>
        </thead>
        <tbody>
          ${questions
            .map(
              (q) => `
            <tr>
              <td style="border:1px solid #94a3b8;padding:6px 8px;text-align:center;vertical-align:top;"><strong>${q.nomor}</strong></td>
              <td style="border:1px solid #94a3b8;padding:6px 8px;vertical-align:top;"><strong>${escapeHtml(q.kunciJawaban)}</strong></td>
              <td style="border:1px solid #94a3b8;padding:6px 8px;vertical-align:top;">
                <div style="font-size:9.5pt;color:#475569;margin-bottom:4px;"><em>Indikator:</em> ${escapeHtml(q.indikatorSoal)} (${q.levelKognitif} · ${q.tingkatKesulitan})</div>
                ${options.includeExplanation ? `<div>${escapeHtml(q.pembahasan).replace(/\n/g, '<br/>')}</div>` : ''}
              </td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`
    : '';

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(meta.judulUjian)} - ${escapeHtml(theme.schoolName)}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #0f172a; margin: 24px; }
    @page { size: A4; margin: 2cm; }
  </style>
</head>
<body>
  <div style="border-bottom:3px double ${escapeHtml(theme.primaryColor)};padding-bottom:10px;margin-bottom:16px;text-align:center;">
    <div style="font-size:10pt;font-weight:bold;letter-spacing:0.06em;color:${escapeHtml(theme.accentColor)};">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
    <div style="font-size:15pt;font-weight:bold;color:${escapeHtml(theme.primaryColor)};margin:2px 0;">${escapeHtml(theme.schoolName.toUpperCase())}</div>
    <div style="font-size:9.5pt;color:#475569;">${escapeHtml(theme.schoolSubtitle)}</div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:10.5pt;background:#f8fafc;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:6px 10px;width:50%;"><strong>Asesmen:</strong> ${escapeHtml(meta.judulUjian)}</td>
      <td style="border:1px solid #cbd5e1;padding:6px 10px;width:50%;"><strong>Tahun Ajaran:</strong> ${escapeHtml(theme.academicYear)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:6px 10px;"><strong>Mata Pelajaran:</strong> ${escapeHtml(meta.mataPelajaran)}</td>
      <td style="border:1px solid #cbd5e1;padding:6px 10px;"><strong>Kelas / Waktu:</strong> ${escapeHtml(meta.kelas)} · ${meta.durasiMenit} Menit</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:6px 10px;"><strong>Penyusun:</strong> ${escapeHtml(meta.guruPenyusun || 'Tim Guru MAN 1 Jember')}</td>
      <td style="border:1px solid #cbd5e1;padding:6px 10px;"><strong>Jumlah Butir:</strong> ${questions.length} Soal TKA</td>
    </tr>
  </table>

  ${questionBlocks}
  ${keySection}
</body>
</html>`;
}

export function generateClassroomCopyText(
  meta: ExamMetadata,
  questions: TkaQuestion[],
  includeKeys: boolean
): string {
  const header = [
    `[${meta.judulUjian.toUpperCase()}]`,
    `Mata Pelajaran: ${meta.mataPelajaran} | Kelas: ${meta.kelas} | Waktu: ${meta.durasiMenit} Menit`,
    `Petunjuk: Kerjakan seluruh butir soal TKA berikut dengan cermat. Untuk soal Pilihan Ganda Kompleks, perhatikan instruksi jawaban jamak atau Benar/Salah.`,
    '='.repeat(56),
  ].join('\n');

  const body = questions
    .map((q) => {
      const parts: string[] = [];
      parts.push(`\n${q.nomor}. [${q.levelKognitif} · ${q.tingkatKesulitan}]`);
      if (q.stimulus) {
        parts.push(`Konteks/Stimulus:\n${q.stimulus}`);
      }
      parts.push(q.pertanyaan);
      if (q.bentukSoal === 'PGK_KATEGORI' && q.pernyataanKategori) {
        parts.push('(Tentukan Benar atau Salah untuk setiap pernyataan:)');
        q.pernyataanKategori.forEach((s, i) => {
          parts.push(`  (${i + 1}) ${s.text} [Benar / Salah]`);
        });
      } else {
        if (q.bentukSoal === 'PGK_JAMAK') {
          parts.push('(Pilih lebih dari satu jawaban yang benar)');
        }
        q.opsi.forEach((o) => {
          parts.push(`  ${o.label}. ${o.text}`);
        });
      }
      if (includeKeys) {
        parts.push(`Kunci Jawaban: ${q.kunciJawaban}`);
        parts.push(`Pembahasan: ${q.pembahasan}`);
      }
      return parts.join('\n');
    })
    .join('\n');

  return `${header}\n${body}`;
}
