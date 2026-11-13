import { useEffect, useRef, useState } from 'react';
import { Palette, BookOpen } from 'lucide-react';
import { ActiveNavSection, Header } from './components/Header';
import { BlueprintSidebar } from './components/BlueprintSidebar';
import { QuestionStage } from './components/QuestionStage';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { ExportModal, triggerFileDownload } from './components/ExportModal';
import { TkaGuideModal } from './components/TkaGuideModal';
import { TKA_PRESETS } from './data/presets';
import {
  ExamMetadata,
  IndicatorBlueprint,
  SchoolThemeConfig,
  TkaQuestion,
} from './types/tka';
import {
  generateMoodleXml,
  generateWordDocHtml,
  renumberQuestions,
  validateBlueprintForm,
} from './utils/exporters';
import { downloadTkaPdf } from './utils/pdfExporter';
import { applyThemeToDocument, loadSavedTheme, saveTheme } from './utils/theme';

const initialPreset = TKA_PRESETS[0];

export default function App() {
  const [theme, setTheme] = useState<SchoolThemeConfig>(() => loadSavedTheme());
  const [activeNav, setActiveNav] = useState<ActiveNavSection>('builder');

  const [meta, setMeta] = useState<ExamMetadata>(initialPreset.meta);
  const [draftBlueprint, setDraftBlueprint] = useState<IndicatorBlueprint>(
    initialPreset.blueprints[0]
  );
  const [queuedBlueprints, setQueuedBlueprints] = useState<IndicatorBlueprint[]>([]);
  const [questions, setQuestions] = useState<TkaQuestion[]>(initialPreset.sampleQuestions);

  const [teacherMode, setTeacherMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const builderRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    applyThemeToDocument(theme);
    saveTheme(theme);
  }, [theme]);

  const handleNavigate = (section: ActiveNavSection) => {
    setActiveNav(section);
    if (section === 'theme') {
      setIsThemeModalOpen(true);
      return;
    }
    if (section === 'guide') {
      setIsGuideModalOpen(true);
      return;
    }
    if (section === 'builder') {
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'preview') {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const found = TKA_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setMeta(found.meta);
    if (found.blueprints.length > 0) {
      setDraftBlueprint(found.blueprints[0]);
      setQueuedBlueprints(found.blueprints.length > 1 ? found.blueprints : []);
    }
    if (found.sampleQuestions.length > 0) {
      setQuestions(found.sampleQuestions);
    }
    setValidationErrors([]);
    setApiError(null);
  };

  const handleAddBlueprintToQueue = () => {
    const validation = validateBlueprintForm(meta, [draftBlueprint]);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    setQueuedBlueprints((prev) => [
      ...prev,
      { ...draftBlueprint, id: `bp-${Date.now()}-${prev.length}` },
    ]);
  };

  const handleRemoveQueuedBlueprint = (id: string) => {
    setQueuedBlueprints((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGenerate = async () => {
    const targetBlueprints = queuedBlueprints.length > 0 ? queuedBlueprints : [draftBlueprint];
    const validation = validateBlueprintForm(meta, targetBlueprints);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setApiError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta,
          blueprints: targetBlueprints,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setApiError(data.error || 'Terjadi kesalahan saat menyusun soal TKA.');
        return;
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(renumberQuestions(data.questions as TkaQuestion[]));
        setActiveNav('preview');
      } else {
        setApiError('Model tidak mengembalikan butir soal. Coba sesuaikan indikator soal Anda.');
      }
    } catch {
      setApiError('Gagal terhubung ke server generator soal. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateQuestion = (updated: TkaQuestion) => {
    setQuestions((prev) =>
      renumberQuestions(prev.map((q) => (q.id === updated.id ? updated : q)))
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => renumberQuestions(prev.filter((q) => q.id !== id)));
  };

  const handleQuickExportDoc = () => {
    const baseName = `${meta.judulUjian || 'Soal_TKA'}_${meta.mataPelajaran || 'Mapel'}`
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .toLowerCase();
    const html = generateWordDocHtml(meta, theme, questions, {
      includeAnswerKey: teacherMode,
      includeExplanation: teacherMode,
    });
    triggerFileDownload(
      `${baseName}${teacherMode ? '_guru' : '_siswa'}.doc`,
      html,
      'application/msword;charset=utf-8'
    );
  };

  const handleQuickExportXml = () => {
    const baseName = `${meta.judulUjian || 'Soal_TKA'}_${meta.mataPelajaran || 'Mapel'}`
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .toLowerCase();
    const xml = generateMoodleXml(meta, questions, teacherMode);
    triggerFileDownload(`${baseName}_moodle.xml`, xml, 'application/xml;charset=utf-8');
  };

  const handleQuickExportPdf = () => {
    downloadTkaPdf(meta, theme, questions, {
      includeAnswerKey: teacherMode,
      includeExplanation: teacherMode,
    });
  };

  return (
    <div
      id="top"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <Header
        theme={theme}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Mobile Secondary Actions Strip */}
      <div className="no-print md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tema</span>
          </button>
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Panduan</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => handleNavigate('preview')}
          className="text-xs font-semibold py-1.5 px-2.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono-tabular cursor-pointer"
        >
          Lihat Soal ({questions.length})
        </button>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[410px_minmax(0,1fr)] gap-6 items-start">
          <div
            ref={builderRef}
            className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1"
          >
            <BlueprintSidebar
              meta={meta}
              onChangeMeta={setMeta}
              draftBlueprint={draftBlueprint}
              onChangeDraft={setDraftBlueprint}
              queuedBlueprints={queuedBlueprints}
              onAddBlueprintToQueue={handleAddBlueprintToQueue}
              onRemoveQueuedBlueprint={handleRemoveQueuedBlueprint}
              onApplyPreset={handleApplyPreset}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              validationErrors={validationErrors}
              apiError={apiError}
            />
          </div>

          <div ref={previewRef} className="min-w-0">
            <QuestionStage
              meta={meta}
              theme={theme}
              questions={questions}
              isGenerating={isGenerating}
              teacherMode={teacherMode}
              onToggleTeacherMode={setTeacherMode}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onClearQuestions={() => setQuestions([])}
              onLoadSamplePack={() => setQuestions(initialPreset.sampleQuestions)}
              onQuickExportDoc={handleQuickExportDoc}
              onQuickExportXml={handleQuickExportXml}
              onQuickExportPdf={handleQuickExportPdf}
            />
          </div>
        </div>
      </main>

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        theme={theme}
        onChangeTheme={setTheme}
        onClose={() => {
          setIsThemeModalOpen(false);
          setActiveNav('builder');
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        meta={meta}
        theme={theme}
        questions={questions}
        onClose={() => setIsExportModalOpen(false)}
      />

      <TkaGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => {
          setIsGuideModalOpen(false);
          setActiveNav('builder');
        }}
      />
    </div>
  );
}
