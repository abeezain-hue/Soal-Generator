import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeXml,
  generateClassroomCopyText,
  generateMoodleXml,
  generateWordDocHtml,
  renumberQuestions,
  validateBlueprintForm,
} from './exporters';
import { DEFAULT_THEME_CONFIG } from './theme';
import { ExamMetadata, IndicatorBlueprint, TkaQuestion } from '../types/tka';

const sampleMeta: ExamMetadata = {
  judulUjian: 'Tryout TKA Semester Ganjil',
  mataPelajaran: 'Matematika',
  kelas: 'XII IPA',
  durasiMenit: 90,
  guruPenyusun: 'Ahmad Fauzi, M.Pd.',
};

const sampleQuestions: TkaQuestion[] = [
  {
    id: 'q1',
    nomor: 1,
    bentukSoal: 'PG',
    tujuanPembelajaran: 'Menganalisis peluang kejadian majemuk',
    materi: 'Peluang & Kombinatorika',
    indikatorSoal: 'Menentukan peluang terambilnya dua bola berbeda warna',
    levelKognitif: 'L2',
    tingkatKesulitan: 'Sedang',
    stimulus: 'Sebuah kotak berisi 4 bola merah & 6 bola biru.',
    pertanyaan: 'Jika diambil 2 bola sekaligus, peluang terambil keduanya berbeda warna adalah...',
    opsi: [
      { label: 'A', text: '4/15', isCorrect: false },
      { label: 'B', text: '8/15', isCorrect: true },
      { label: 'C', text: '2/5', isCorrect: false },
      { label: 'D', text: '3/5', isCorrect: false },
      { label: 'E', text: '1/3', isCorrect: false },
    ],
    kunciJawaban: 'B',
    pembahasan: 'C(4,1)*C(6,1)/C(10,2) = 24/45 = 8/15.',
  },
  {
    id: 'q2',
    nomor: 2,
    bentukSoal: 'PGK_JAMAK',
    tujuanPembelajaran: 'Mengevaluasi sifat fungsi kuadrat',
    materi: 'Fungsi Kuadrat',
    indikatorSoal: 'Mengidentifikasi lebih dari satu pernyataan benar terkait grafik parabola',
    levelKognitif: 'L3',
    tingkatKesulitan: 'Sukar',
    pertanyaan: 'Manakah pernyataan yang benar mengenai f(x) = x^2 - 4x + 3?',
    opsi: [
      { label: 'A', text: 'Memotong sumbu X di (1,0) dan (3,0)', isCorrect: true },
      { label: 'B', text: 'Sumbu simetri di x = -2', isCorrect: false },
      { label: 'C', text: 'Nilai minimum fungsi adalah -1', isCorrect: true },
      { label: 'D', text: 'Terbuka ke bawah', isCorrect: false },
    ],
    kunciJawaban: 'A, C',
    pembahasan: 'Akar (x-1)(x-3)=0 -> x=1,3. Sumbu simetri x=2, f(2)=-1.',
  },
  {
    id: 'q3',
    nomor: 3,
    bentukSoal: 'PGK_KATEGORI',
    tujuanPembelajaran: 'Menilai kebenaran pernyataan statistika',
    materi: 'Statistika Deskriptif',
    indikatorSoal: 'Menentukan benar/salah pernyataan tentang rata-rata dan median',
    levelKognitif: 'L2',
    tingkatKesulitan: 'Sedang',
    pertanyaan: 'Diberikan data nilai ulangan: 70, 80, 80, 90, 100.',
    opsi: [],
    pernyataanKategori: [
      { id: 's1', text: 'Rata-rata data adalah 84', isCorrect: true },
      { id: 's2', text: 'Median data adalah 90', isCorrect: false },
    ],
    kunciJawaban: '1-Benar, 2-Salah',
    pembahasan: 'Rata-rata = 420/5 = 84. Median = 80.',
  },
];

test('escapeXml escapes special XML characters safely', () => {
  assert.equal(escapeXml('4 < 5 & 6 > 3 "ok" \'yes\''), '4 &lt; 5 &amp; 6 &gt; 3 &quot;ok&quot; &apos;yes&apos;');
});

test('generateMoodleXml produces valid PG, PGK_JAMAK, and PGK_KATEGORI Moodle XML', () => {
  const xml = generateMoodleXml(sampleMeta, sampleQuestions, true);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<quiz>'));
  assert.ok(xml.includes('</quiz>'));
  assert.ok(xml.includes('<single>true</single>'));
  assert.ok(xml.includes('<single>false</single>'));
  assert.ok(xml.includes('fraction="50"'));
  assert.ok(xml.includes('<question type="matching">'));
  assert.ok(xml.includes('<text>Benar</text>'));
  assert.ok(xml.includes('<text>Salah</text>'));
  assert.ok(xml.includes('Pembahasan:'));
});

test('generateWordDocHtml respects includeAnswerKey toggle and includes school header', () => {
  const withKeys = generateWordDocHtml(sampleMeta, DEFAULT_THEME_CONFIG, sampleQuestions, {
    includeAnswerKey: true,
    includeExplanation: true,
  });
  assert.ok(withKeys.includes('MAN 1 JEMBER'));
  assert.ok(withKeys.includes('KUNCI JAWABAN &amp; PEMBAHASAN OTOMATIS'));
  assert.ok(withKeys.includes('C(4,1)*C(6,1)/C(10,2)'));

  const studentOnly = generateWordDocHtml(sampleMeta, DEFAULT_THEME_CONFIG, sampleQuestions, {
    includeAnswerKey: false,
    includeExplanation: false,
  });
  assert.ok(!studentOnly.includes('KUNCI JAWABAN'));
  assert.ok(!studentOnly.includes('C(4,1)*C(6,1)/C(10,2)'));
});

test('generateClassroomCopyText formats student and teacher versions', () => {
  const studentText = generateClassroomCopyText(sampleMeta, sampleQuestions, false);
  assert.ok(studentText.includes('TRYOUT TKA SEMESTER GANJIL'));
  assert.ok(!studentText.includes('Kunci Jawaban:'));

  const teacherText = generateClassroomCopyText(sampleMeta, sampleQuestions, true);
  assert.ok(teacherText.includes('Kunci Jawaban: A, C'));
});

test('validateBlueprintForm catches missing fields and excessive counts', () => {
  const emptyBp: IndicatorBlueprint[] = [
    {
      id: '1',
      tujuanPembelajaran: '',
      materi: '',
      indikatorSoal: '',
      levelKognitif: 'L2',
      tingkatKesulitan: 'Sedang',
      bentukSoal: 'PG',
      jumlahButir: 0,
    },
  ];
  const res = validateBlueprintForm({ mataPelajaran: '', kelas: '' }, emptyBp);
  assert.equal(res.valid, false);
  assert.ok(res.errors.length >= 5);
});

test('renumberQuestions assigns sequential 1-based numbers', () => {
  const sliced = renumberQuestions(sampleQuestions.slice(1));
  assert.deepEqual(
    sliced.map((q) => q.nomor),
    [1, 2]
  );
});
