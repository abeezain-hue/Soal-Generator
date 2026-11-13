import { ExamMetadata, IndicatorBlueprint, TkaQuestion } from '../types/tka';

export interface TkaPreset {
  id: string;
  label: string;
  meta: ExamMetadata;
  blueprints: IndicatorBlueprint[];
  sampleQuestions: TkaQuestion[];
}

export const TKA_PRESETS: TkaPreset[] = [
  {
    id: 'matematika-tka-xii',
    label: 'Matematika Wajib XII — Peluang & Statistika',
    meta: {
      judulUjian: 'Asesmen Tes Kemampuan Akademik (TKA)',
      mataPelajaran: 'Matematika Wajib',
      kelas: 'XII MA',
      durasiMenit: 90,
      guruPenyusun: 'Tim MGMP Matematika MAN 1 Jember',
    },
    blueprints: [
      {
        id: 'bp-mat-1',
        tujuanPembelajaran:
          'Peserta didik mampu menganalisis aturan pencacahan dan peluang kejadian majemuk dalam konteks nyata secara akurat.',
        materi: 'Peluang & Kaidah Pencacahan',
        indikatorSoal:
          'Disajikan kasus pemilihan tim olimpiade madrasah dengan syarat komposisi tertentu, peserta didik menentukan peluang atau banyak cara susunan tim.',
        levelKognitif: 'L2',
        tingkatKesulitan: 'Sedang',
        bentukSoal: 'PG',
        jumlahButir: 2,
      },
      {
        id: 'bp-mat-2',
        tujuanPembelajaran:
          'Peserta didik mampu mengevaluasi ukuran pemusatan dan penyebaran data kelompok dari tabel atau infografis.',
        materi: 'Statistika Deskriptif',
        indikatorSoal:
          'Disajikan data nilai hasil tryout siswa MAN 1 Jember, peserta didik mengevaluasi kebenaran beberapa pernyataan terkait rata-rata, median, dan jangkauan.',
        levelKognitif: 'L3',
        tingkatKesulitan: 'Sukar',
        bentukSoal: 'PGK_JAMAK',
        jumlahButir: 1,
      },
    ],
    sampleQuestions: [
      {
        id: 'demo-mat-1',
        nomor: 1,
        bentukSoal: 'PG',
        tujuanPembelajaran:
          'Peserta didik mampu menganalisis aturan pencacahan dan peluang kejadian majemuk dalam konteks nyata secara akurat.',
        materi: 'Peluang & Kaidah Pencacahan',
        indikatorSoal:
          'Disajikan kasus pemilihan tim olimpiade madrasah dengan syarat komposisi tertentu, peserta didik menentukan peluang terpilihnya komposisi tim.',
        levelKognitif: 'L2',
        tingkatKesulitan: 'Sedang',
        stimulus:
          'MAN 1 Jember akan mengirimkan delegasi Lomba Karya Ilmiah Remaja yang terdiri atas 3 siswa. Dari babak seleksi internal terdapat 5 kandidat putra dan 4 kandidat putri dengan kemampuan setara.',
        pertanyaan:
          'Jika panitia memilih 3 siswa secara acak, berapakah peluang delegasi tersebut terdiri atas tepat 2 siswa putra dan 1 siswa putri?',
        opsi: [
          { label: 'A', text: '10/21', isCorrect: true },
          { label: 'B', text: '5/14', isCorrect: false },
          { label: 'C', text: '20/63', isCorrect: false },
          { label: 'D', text: '4/21', isCorrect: false },
          { label: 'E', text: '5/42', isCorrect: false },
        ],
        kunciJawaban: 'A',
        pembahasan:
          'Banyak cara memilih 3 siswa dari total 9 kandidat adalah C(9,3) = (9×8×7)/(3×2×1) = 84. Banyak cara memilih 2 putra dari 5 putra dan 1 putri dari 4 putri adalah C(5,2) × C(4,1) = 10 × 4 = 40. Maka peluangnya = 40/84 = 10/21.',
      },
      {
        id: 'demo-mat-2',
        nomor: 2,
        bentukSoal: 'PGK_JAMAK',
        tujuanPembelajaran:
          'Peserta didik mampu mengevaluasi ukuran pemusatan dan penyebaran data kelompok dari tabel atau infografis.',
        materi: 'Statistika Deskriptif',
        indikatorSoal:
          'Disajikan data nilai hasil tryout siswa, peserta didik memilih seluruh pernyataan yang bernilai benar.',
        levelKognitif: 'L3',
        tingkatKesulitan: 'Sukar',
        stimulus:
          'Nilai Tryout TKA 8 siswa kelas XII IPA tercatat sebagai berikut: 65, 70, 75, 80, 80, 85, 90, 95. Guru memutuskan menambah 5 poin bonus untuk setiap siswa karena perbaikan soal.',
        pertanyaan:
          'Manakah pernyataan berikut yang BENAR setelah penambahan 5 poin bonus? (Pilih lebih dari satu jawaban benar)',
        opsi: [
          { label: 'A', text: 'Rata-rata nilai kelas meningkat dari 80 menjadi 85.', isCorrect: true },
          { label: 'B', text: 'Median nilai menjadi 85 karena seluruh data bertambah 5.', isCorrect: true },
          { label: 'C', text: 'Jangkauan (range) data ikut bertambah sebesar 5 poin.', isCorrect: false },
          { label: 'D', text: 'Simpangan baku data tetap sama seperti sebelum bonus.', isCorrect: true },
          { label: 'E', text: 'Modus data tetap bernilai 80.', isCorrect: false },
        ],
        kunciJawaban: 'A, B, D',
        pembahasan:
          'Rata-rata awal = (65+70+75+80+80+85+90+95)/8 = 640/8 = 80; setelah ditambah 5 menjadi 85 (A benar). Median awal = (80+80)/2 = 80; setelah ditambah 5 menjadi 85 (B benar). Ukuran penyebaran (jangkauan dan simpangan baku) tidak berubah jika setiap datum ditambah konstanta yang sama (C salah, D benar). Modus berubah dari 80 menjadi 85 (E salah).',
      },
      {
        id: 'demo-mat-3',
        nomor: 3,
        bentukSoal: 'PGK_KATEGORI',
        tujuanPembelajaran:
          'Peserta didik mampu menginterpretasi model fungsi linear dan kuadrat dalam persoalan optimasi sederhana.',
        materi: 'Fungsi & Optimasi',
        indikatorSoal:
          'Disajikan model pendapatan koperasi siswa, peserta didik menentukan kebenaran setiap pernyataan analisis.',
        levelKognitif: 'L3',
        tingkatKesulitan: 'Sedang',
        stimulus:
          'Koperasi Siswa MAN 1 Jember memproduksi paket alat tulis dengan fungsi keuntungan harian P(x) = -2x² + 40x - 120 (dalam ribuan rupiah), di mana x adalah jumlah paket yang terjual.',
        pertanyaan: 'Tentukan status Benar atau Salah untuk setiap pernyataan berikut berdasarkan fungsi keuntungan tersebut.',
        opsi: [],
        pernyataanKategori: [
          { id: 'cat-1', text: 'Keuntungan maksimum harian tercapai saat terjual 10 paket.', isCorrect: true },
          { id: 'cat-2', text: 'Keuntungan maksimum yang diperoleh adalah Rp100.000,00.', isCorrect: false },
          { id: 'cat-3', text: 'Koperasi mengalami rugi jika hanya mampu menjual 2 paket dalam sehari.', isCorrect: true },
        ],
        kunciJawaban: '1-Benar, 2-Salah, 3-Benar',
        pembahasan:
          '1) Titik puncak x = -b/(2a) = -40/(2×(-2)) = 10 paket (Benar). 2) P(10) = -2(100) + 400 - 120 = 80 ribu = Rp80.000,00, bukan Rp100.000,00 (Salah). 3) P(2) = -2(4) + 80 - 120 = -48 (rugi Rp48.000,00) (Benar).',
      },
    ],
  },
  {
    id: 'literasi-bindo-xii',
    label: 'Bahasa Indonesia XII — Literasi Teks & Penalaran',
    meta: {
      judulUjian: 'Latihan Standar TKA Literasi Bahasa Indonesia',
      mataPelajaran: 'Bahasa Indonesia',
      kelas: 'XII MA',
      durasiMenit: 60,
      guruPenyusun: 'Tim MGMP Bahasa Indonesia MAN 1 Jember',
    },
    blueprints: [
      {
        id: 'bp-ind-1',
        tujuanPembelajaran:
          'Peserta didik mampu mengevaluasi gagasan utama, informasi tersirat, dan relevansi argumen pada teks ilmiah populer.',
        materi: 'Teks Argumentasi & Literasi Informasi',
        indikatorSoal:
          'Disajikan teks tentang ketahanan pangan dan pertanian berkelanjutan di Jawa Timur, peserta didik menyimpulkan gagasan pokok dan menguji kesesuaian pernyataan.',
        levelKognitif: 'L3',
        tingkatKesulitan: 'Sedang',
        bentukSoal: 'PGK_KATEGORI',
        jumlahButir: 2,
      },
    ],
    sampleQuestions: [],
  },
  {
    id: 'biologi-xi-metabolisme',
    label: 'Biologi XII — Metabolisme Sel & Enzim',
    meta: {
      judulUjian: 'Evaluasi TKA Biologi — Enzim & Respirasi Seluler',
      mataPelajaran: 'Biologi',
      kelas: 'XII IPA',
      durasiMenit: 75,
      guruPenyusun: 'Tim MGMP Biologi MAN 1 Jember',
    },
    blueprints: [
      {
        id: 'bp-bio-1',
        tujuanPembelajaran:
          'Peserta didik mampu menganalisis faktor yang memengaruhi kerja enzim katalase serta tahapan respirasi aerob.',
        materi: 'Enzim & Metabolisme Sel',
        indikatorSoal:
          'Disajikan tabel hasil praktikum enzim katalase pada suhu dan pH berbeda, peserta didik menyimpulkan kondisi optimum kerja enzim.',
        levelKognitif: 'L2',
        tingkatKesulitan: 'Sedang',
        bentukSoal: 'PG',
        jumlahButir: 3,
      },
    ],
    sampleQuestions: [],
  },
];
