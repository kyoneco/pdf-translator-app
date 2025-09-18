import { useCallback, useEffect, useMemo, useState } from 'react';
import SplitLayout from './components/SplitLayout';
import Toolbar from './components/Toolbar';
import ViewerPane from './components/ViewerPane';
import TranslationPane from './components/TranslationPane';
import { MockTranslationService } from './services/MockTranslationService';
import { useTranslation } from './hooks/useTranslation';
import type { Theme, ViewMode, ViewerSource } from './types/viewer';
import placeholderPdf from './assets/placeholder.pdf?url';

const THEME_STORAGE_KEY = 'pdf-translator-theme';

function withBase(path: string): string {
  const base = typeof __BASE_URL__ !== 'undefined' ? __BASE_URL__ : import.meta.env.BASE_URL;
  if (/^https?:/i.test(path)) {
    return path;
  }
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (path.startsWith(normalizedBase)) {
    return path;
  }
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${suffix}`;
}

function detectInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function getSourceLabel(source: ViewerSource | null, page: number, totalPages: number): string | undefined {
  if (!source) return undefined;
  if (source.type === 'pdf') {
    return totalPages > 0 ? `ページ ${page} / ${totalPages}` : `ページ ${page}`;
  }
  return 'HTML プレビュー';
}

async function loadPlaceholder(): Promise<ViewerSource | null> {
  try {
    const response = await fetch(withBase(placeholderPdf));
    const buffer = await response.arrayBuffer();
    return { type: 'pdf', data: new Uint8Array(buffer), name: 'placeholder.pdf' };
  } catch (error) {
    console.warn('Failed to load placeholder PDF', error);
    return null;
  }
}

function App() {
  const translationService = useMemo(() => new MockTranslationService(), []);
  const { translate, translation, isTranslating, error, cancel, reset } = useTranslation(translationService);

  const [theme, setTheme] = useState<Theme>('light');
  const [viewerSource, setViewerSource] = useState<ViewerSource | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [extractedText, setExtractedText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const initial = detectInitialTheme();
    setTheme(initial);
    applyTheme(initial);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        const next = event.matches ? 'dark' : 'light';
        setTheme(next);
        applyTheme(next);
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    loadPlaceholder().then((source) => {
      if (source) {
        setViewerSource(source);
      }
    });
  }, []);

  const handleThemeChange = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      cancel();
      reset();
      setStatusMessage(null);
      setCurrentPage(1);
      setPageCount(0);
      setExtractedText('');

      const fileName = file.name;
      const lower = fileName.toLowerCase();
      try {
        if (lower.endsWith('.pdf')) {
          const buffer = await file.arrayBuffer();
          setViewerSource({ type: 'pdf', data: new Uint8Array(buffer), name: fileName });
        } else if (lower.endsWith('.html') || lower.endsWith('.htm')) {
          const content = await file.text();
          setViewerSource({ type: 'html', content, name: fileName });
        } else {
          setViewerSource(null);
          setStatusMessage('未対応の形式です。PDF または HTML を選択してください。');
        }
      } catch (err) {
        console.error(err);
        setViewerSource(null);
        setStatusMessage('ファイルの読み込みに失敗しました。');
      }
    },
    [cancel, reset],
  );

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    reset();
  }, [reset]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (pageCount > 0) {
        return Math.min(prev + 1, pageCount);
      }
      return prev + 1;
    });
    reset();
  }, [pageCount, reset]);

  const handleTranslate = useCallback(() => {
    if (!viewerSource) {
      setStatusMessage('ファイルを読み込んでください。');
      return;
    }
    if (!extractedText.trim()) {
      setStatusMessage('翻訳できるテキストが見つかりません。');
      return;
    }
    setStatusMessage(null);
    void translate({
      text: extractedText,
      sourceType: viewerSource.type,
      sourceName: viewerSource.name,
      pageNumber: viewerSource.type === 'pdf' ? currentPage : undefined,
      targetLanguage: 'ja',
    });
  }, [currentPage, extractedText, translate, viewerSource]);

  const handleClearTranslation = useCallback(() => {
    cancel();
    reset();
  }, [cancel, reset]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const sourceLabel = getSourceLabel(viewerSource, currentPage, pageCount);

  return (
    <div className="flex h-screen flex-col bg-surface text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <Toolbar
        theme={theme}
        onThemeChange={handleThemeChange}
        onFileSelect={handleFileSelect}
        onTranslate={handleTranslate}
        onCancel={cancel}
        disableTranslate={!viewerSource || !extractedText.trim()}
        isTranslating={isTranslating}
        page={currentPage}
        pageCount={pageCount}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        canNavigate={!!viewerSource && viewerSource.type === 'pdf' && pageCount > 0}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        statusMessage={statusMessage}
        fileName={viewerSource?.name}
        isViewerLoading={isViewerLoading}
      />
      <main className="flex-1 overflow-hidden bg-surface-muted px-3 py-4 transition-colors dark:bg-slate-900">
        <SplitLayout viewMode={viewMode}>
          <ViewerPane
            source={viewerSource}
            currentPage={currentPage}
            onPageCountChange={setPageCount}
            onTextExtracted={setExtractedText}
            onLoadingChange={setIsViewerLoading}
          />
          <TranslationPane
            translation={translation}
            isTranslating={isTranslating}
            error={error}
            fileName={viewerSource?.name}
            sourceLabel={sourceLabel}
            onClear={handleClearTranslation}
          />
        </SplitLayout>
      </main>
    </div>
  );
}

export default App;
