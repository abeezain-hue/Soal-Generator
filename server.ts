import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlueprintPayload {
  id: string;
  tujuanPembelajaran: string;
  materi: string;
  indikatorSoal: string;
  levelKognitif: 'L1' | 'L2' | 'L3';
  tingkatKesulitan: 'Mudah' | 'Sedang' | 'Sukar';
  bentukSoal: 'PG' | 'PGK_JAMAK' | 'PGK_KATEGORI';
  jumlahButir: number;
}

interface GenerateRequestBody {
  meta: {
    judulUjian: string;
    mataPelajaran: string;
    kelas: string;
    durasiMenit: number;
    guruPenyusun: string;
  };
  blueprints: BlueprintPayload[];
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const cognitiveGuidance: Record<'L1' | 'L2' | 'L3', string> = {
  L1: 'Level 1 (Pengetahuan & Pemahaman, C1–C2): mengukur ingatan konsep dasar, definisi, identifikasi fakta, atau pemahaman prosedural langsung.',
  L2: 'Level 2 (Aplikasi, C3): mengukur kemampuan menerapkan konsep/rumus/kaidah pada situasi atau kasus kontekstual yang baru.',
  L3: 'Level 3 (Penalaran & HOTS, C4–C6): menuntut analisis mendalam, evaluasi argumen, sintesis multi-konsep, atau pemecahan masalah kompleks berbasis stimulus.',
};

const formatGuidance: Record<'PG' | 'PGK_JAMAK' | 'PGK_KATEGORI', string> = {
  PG: 'Pilihan Ganda Biasa (PG): wajib memiliki TEPAT 5 opsi berlabel A, B, C, D, E, dengan TEPAT 1 opsi bernilai isCorrect=true dan 4 pengecoh homogen yang logis. Field pernyataanKategori harus array kosong [].',
  PGK_JAMAK:
    'Pilihan Ganda Kompleks Jawaban Jamak (PGK_JAMAK): wajib memiliki 4 atau 5 opsi berlabel A, B, C, D, (E), dengan 2 atau 3 opsi bernilai isCorrect=true (lebih dari satu jawaban benar). Field pernyataanKategori harus array kosong []. Sertakan instruksi singkat "(Pilih lebih dari satu jawaban benar)" atau yang setara.',
  PGK_KATEGORI:
    'Pilihan Ganda Kompleks Kategori Benar/Salah (PGK_KATEGORI): wajib mengisi field pernyataanKategori dengan 3 hingga 4 pernyataan evaluatif yang jelas, masing-masing bernilai isCorrect=true (Benar) atau isCorrect=false (Salah), dengan kombinasi Benar dan Salah yang seimbang. Field opsi harus array kosong [].',
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/generate-questions', async (req: Request, res: Response) => {
    try {
      const body = req.body as GenerateRequestBody;
      if (!body || !body.meta || !Array.isArray(body.blueprints) || body.blueprints.length === 0) {
        return res.status(400).json({ error: 'Permintaan tidak lengkap: meta dan kisi-kisi wajib diisi.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            'GEMINI_API_KEY belum dikonfigurasi pada panel Settings > Secrets. Silakan atur kunci API atau gunakan paket contoh kisi-kisi untuk mencoba ekspor.',
        });
      }

      const totalCount = body.blueprints.reduce((sum, bp) => sum + (Number(bp.jumlahButir) || 0), 0);
      if (totalCount < 1 || totalCount > 30) {
        return res.status(400).json({ error: 'Total jumlah butir soal harus antara 1 sampai 30 per permintaan.' });
      }

      const blueprintInstructions = body.blueprints
        .map((bp, idx) => {
          return [
            `--- Kisi-kisi #${idx + 1} ---`,
            `Jumlah Butir Wajib: ${bp.jumlahButir} soal`,
            `Bentuk Soal: ${bp.bentukSoal} (${formatGuidance[bp.bentukSoal]})`,
            `Tujuan Pembelajaran: ${bp.tujuanPembelajaran}`,
            `Materi / Sub-Materi: ${bp.materi}`,
            `Indikator Soal: ${bp.indikatorSoal}`,
            `Level Kognitif: ${bp.levelKognitif} — ${cognitiveGuidance[bp.levelKognitif]}`,
            `Tingkat Kesulitan: ${bp.tingkatKesulitan}`,
          ].join('\n');
        })
        .join('\n\n');

      const prompt = `Buatlah paket soal standar Tes Kemampuan Akademik (TKA) jenjang Madrasah Aliyah (MAN 1 Jember) dalam Bahasa Indonesia akademik yang baku, cermat, dan bebas bias.

Informasi Asesmen:
- Judul: ${body.meta.judulUjian}
- Mata Pelajaran: ${body.meta.mataPelajaran}
- Kelas/Jenjang: ${body.meta.kelas}
- Total Soal Diminta: ${totalCount} butir soal (HARUS tepat ${totalCount} soal sesuai urutan kisi-kisi di bawah).

Daftar Kisi-Kisi:
${blueprintInstructions}

Kaidah Penulisan Soal Standar TKA:
1. Sertakan "stimulus" (wacana singkat, data kuantitatif, kasus kontekstual, atau kutipan relevan) pada soal yang menuntut konteks, khususnya L2 dan L3.
2. Pokok soal ("pertanyaan") harus dirumuskan dengan tegas, tidak menimbulkan tafsir ganda, dan selaras persis dengan indikator soal.
3. Untuk PG: tepat 5 opsi (A–E) dengan 1 kunci benar dan 4 pengecoh masuk akal.
4. Untuk PGK_JAMAK: 4–5 opsi (A–E) dengan 2–3 jawaban benar. Field "kunciJawaban" ditulis seperti "A, C, D".
5. Untuk PGK_KATEGORI: 3–4 pernyataan pada "pernyataanKategori" dengan campuran true (Benar) dan false (Salah). Field "kunciJawaban" ditulis seperti "1-Benar, 2-Salah, 3-Benar".
6. Setiap soal WAJIB menyertakan "kunciJawaban" yang konsisten dengan flag isCorrect, serta "pembahasan" otomatis yang terstruktur, jelas langkah demi langkah, dan menjelaskan alasan kunci benar maupun mengapa pengecoh kurang tepat.
7. Kembalikan JSON sesuai skema yang ditentukan.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah pakar asesmen pendidikan nasional dan penyusun soal standar TKA/SNBT/AKM untuk Madrasah Aliyah di Indonesia. Seluruh soal harus akurat secara keilmuan, terstruktur rapi, dan memiliki kunci jawaban serta pembahasan yang konsisten 100%.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    bentukSoal: {
                      type: Type.STRING,
                      description: 'Harus salah satu dari: PG, PGK_JAMAK, PGK_KATEGORI',
                    },
                    tujuanPembelajaran: { type: Type.STRING },
                    materi: { type: Type.STRING },
                    indikatorSoal: { type: Type.STRING },
                    levelKognitif: {
                      type: Type.STRING,
                      description: 'Harus salah satu dari: L1, L2, L3',
                    },
                    tingkatKesulitan: {
                      type: Type.STRING,
                      description: 'Harus salah satu dari: Mudah, Sedang, Sukar',
                    },
                    stimulus: {
                      type: Type.STRING,
                      description: 'Konteks/wacana/data kasus pendukung soal. Boleh string kosong jika tidak diperlukan.',
                    },
                    pertanyaan: { type: Type.STRING },
                    opsi: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          text: { type: Type.STRING },
                          isCorrect: { type: Type.BOOLEAN },
                        },
                        required: ['label', 'text', 'isCorrect'],
                      },
                    },
                    pernyataanKategori: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          isCorrect: { type: Type.BOOLEAN },
                        },
                        required: ['text', 'isCorrect'],
                      },
                    },
                    kunciJawaban: { type: Type.STRING },
                    pembahasan: { type: Type.STRING },
                  },
                  required: [
                    'bentukSoal',
                    'tujuanPembelajaran',
                    'materi',
                    'indikatorSoal',
                    'levelKognitif',
                    'tingkatKesulitan',
                    'pertanyaan',
                    'opsi',
                    'pernyataanKategori',
                    'kunciJawaban',
                    'pembahasan',
                  ],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as { questions?: unknown[] };
      const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

      const normalized = rawQuestions.map((item: any, index: number) => {
        const format =
          item.bentukSoal === 'PGK_JAMAK' || item.bentukSoal === 'PGK_KATEGORI'
            ? item.bentukSoal
            : 'PG';
        const level =
          item.levelKognitif === 'L1' || item.levelKognitif === 'L2' || item.levelKognitif === 'L3'
            ? item.levelKognitif
            : 'L2';
        const diff =
          item.tingkatKesulitan === 'Mudah' ||
          item.tingkatKesulitan === 'Sedang' ||
          item.tingkatKesulitan === 'Sukar'
            ? item.tingkatKesulitan
            : 'Sedang';

        const opsi = Array.isArray(item.opsi)
          ? item.opsi.map((o: any, oIdx: number) => ({
              label: String(o.label || String.fromCharCode(65 + oIdx)),
              text: String(o.text || ''),
              isCorrect: Boolean(o.isCorrect),
            }))
          : [];

        const pernyataanKategori = Array.isArray(item.pernyataanKategori)
          ? item.pernyataanKategori.map((s: any, sIdx: number) => ({
              id: `stmt-${Date.now()}-${index}-${sIdx}`,
              text: String(s.text || ''),
              isCorrect: Boolean(s.isCorrect),
            }))
          : [];

        let derivedKey = String(item.kunciJawaban || '').trim();
        if (format === 'PG') {
          const correctOpt = opsi.find((o: any) => o.isCorrect);
          if (correctOpt) derivedKey = correctOpt.label;
        } else if (format === 'PGK_JAMAK') {
          const correctLabels = opsi.filter((o: any) => o.isCorrect).map((o: any) => o.label);
          if (correctLabels.length > 0) derivedKey = correctLabels.join(', ');
        } else if (format === 'PGK_KATEGORI' && pernyataanKategori.length > 0) {
          derivedKey = pernyataanKategori
            .map((s: any, sIdx: number) => `${sIdx + 1}-${s.isCorrect ? 'Benar' : 'Salah'}`)
            .join(', ');
        }

        return {
          id: `tka-${Date.now()}-${index}`,
          nomor: index + 1,
          bentukSoal: format,
          tujuanPembelajaran: String(item.tujuanPembelajaran || ''),
          materi: String(item.materi || ''),
          indikatorSoal: String(item.indikatorSoal || ''),
          levelKognitif: level,
          tingkatKesulitan: diff,
          stimulus: item.stimulus ? String(item.stimulus) : undefined,
          pertanyaan: String(item.pertanyaan || ''),
          opsi: format === 'PGK_KATEGORI' ? [] : opsi,
          pernyataanKategori: format === 'PGK_KATEGORI' ? pernyataanKategori : undefined,
          kunciJawaban: derivedKey || 'A',
          pembahasan: String(item.pembahasan || ''),
        };
      });

      return res.json({ questions: normalized });
    } catch (err: any) {
      console.error('Error generating TKA questions:', err);
      const status = err?.status || 500;
      const msg = err?.message || 'Gagal menghasilkan soal TKA melalui Gemini API.';
      return res.status(status >= 400 && status < 600 ? status : 500).json({ error: msg });
    }
  });

  app.post('/api/export/moodle', async (req: Request, res: Response) => {
    try {
      const { moodleUrl, token, categoryId, wsFunction, xmlContent } = req.body as {
        moodleUrl?: string;
        token?: string;
        categoryId?: string;
        wsFunction?: string;
        xmlContent?: string;
      };

      if (!moodleUrl || !token) {
        return res.status(400).json({
          error: 'URL situs Moodle dan Token Web Service wajib diisi untuk ekspor langsung.',
        });
      }

      const cleanBase = moodleUrl.trim().replace(/\/+$/, '');
      if (!/^https?:\/\//i.test(cleanBase)) {
        return res.status(400).json({ error: 'URL Moodle harus diawali dengan http:// atau https://.' });
      }

      const endpoint = `${cleanBase}/webservice/rest/server.php`;
      const targetFn = (wsFunction || '').trim() || 'core_webservice_get_site_info';

      const form = new URLSearchParams();
      form.set('wstoken', token.trim());
      form.set('wsfunction', targetFn);
      form.set('moodlewsrestformat', 'json');
      if (targetFn !== 'core_webservice_get_site_info') {
        if (categoryId) form.set('categoryid', categoryId.trim());
        if (xmlContent) form.set('xml', xmlContent);
      }

      const moodleRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });

      const responseData = await moodleRes.json().catch(() => null);
      if (!moodleRes.ok || (responseData && responseData.exception)) {
        return res.status(400).json({
          error:
            responseData?.message ||
            `Moodle menolak permintaan (HTTP ${moodleRes.status}). Periksa URL, token, atau izin fungsi Web Service.`,
          details: responseData,
        });
      }

      return res.json({
        ok: true,
        wsFunction: targetFn,
        moodleResponse: responseData,
        message:
          targetFn === 'core_webservice_get_site_info'
            ? `Koneksi ke situs Moodle "${responseData?.sitename || cleanBase}" berhasil terverifikasi! Gunakan fungsi impor kustom atau unggah file Moodle XML pada bank soal.`
            : 'Soal berhasil dikirim ke endpoint Web Service Moodle.',
      });
    } catch (err: any) {
      return res.status(502).json({
        error: `Tidak dapat menjangkau server Moodle: ${err?.message || 'Koneksi gagal.'}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`MAN 1 Jember TKA Generator server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
