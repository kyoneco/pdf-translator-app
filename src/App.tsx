import { useCallback, useEffect, useMemo, useState } from 'react';
import Toolbar from './components/Toolbar';
import SplitLayout from './components/SplitLayout';
import ViewerPane from './components/ViewerPane';
import TranslationPane from './components/TranslationPane';
import type { Theme } from './components/ThemeToggle';
import type { ViewerSource } from './types/viewer';
import { MockTranslationService } from './services/MockTranslationService';
import { useTranslation } from './hooks/useTranslation';

const THEME_STORAGE_KEY = 'pdf-translator-theme';

function detectTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function getSourceLabel(source: ViewerSource | null, currentPage: number): string | undefined {
  if (!source) return undefined;
  if (source.type === 'pdf') {
    return `ページ ${currentPage}`;
  }
  return 'HTML プレビュー';
}

function App() {
  const translationService = useMemo(() => new MockTranslationService(), []);
  const { translate, translation, isTranslating, error, reset } = useTranslation(translationService);

  const [theme, setTheme] = useState<Theme>('light');
  const [viewerSource, setViewerSource] = useState<ViewerSource | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageText, setCurrentPageText] = useState('');
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  useEffect(() => {
    const initialTheme = detectTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleThemeChange = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setStatusMessage(null);
    reset();
    setCurrentPage(1);
    setPageCount(0);
    setCurrentPageText('');

    const extension = file.name.toLowerCase();
    try {
      if (extension.endsWith('.pdf')) {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);
        setViewerSource({ type: 'pdf', data, name: file.name });
        setFileName(file.name);
      } else if (extension.endsWith('.html') || extension.endsWith('.htm')) {
        const content = await file.text();
        setViewerSource({ type: 'html', content, name: file.name });
        setFileName(file.name);
        setPageCount(1);
        setCurrentPage(1);
      } else {
        setStatusMessage('未対応のファイル形式です。PDF または HTML を選択してください。');
        setViewerSource(null);
        setFileName(undefined);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('ファイルの読み込みに失敗しました。');
      setViewerSource(null);
      setFileName(undefined);
    }
  }, [reset]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((page) => Math.max(page - 1, 1));
    reset();
  }, [reset]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((page) => (pageCount ? Math.min(page + 1, pageCount) : page + 1));
    reset();
  }, [pageCount, reset]);

  const handlePageCountChange = useCallback((count: number) => {
    setPageCount(count);
    if (count > 0) {
      setCurrentPage((page) => Math.min(Math.max(page, 1), count));
    }
  }, []);

  const handlePageTextChange = useCallback((text: string) => {
    setCurrentPageText(text);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!viewerSource || !currentPageText.trim()) {
      setStatusMessage('翻訳できるテキストがありません。');
      return;
    }

    setStatusMessage(null);

    await translate({
      text: currentPageText,
      sourceType: viewerSource.type,
      sourceName: viewerSource.name,
      pageNumber: viewerSource.type === 'pdf' ? currentPage : undefined,
      targetLanguage: 'ja',
    });
  }, [currentPage, currentPageText, translate, viewerSource]);

  useEffect(() => {
    if (viewerSource) {
      setStatusMessage(null);
    }
  }, [viewerSource]);

  const disableNavigation = !viewerSource || (viewerSource.type === 'html');

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        theme={theme}
        onThemeChange={handleThemeChange}
        onFileSelect={handleFileSelect}
        fileName={fileName}
        page={currentPage}
        pageCount={pageCount}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        canNavigate={!disableNavigation && pageCount > 0}
        onTranslate={handleTranslate}
        isTranslating={isTranslating}
        isViewerLoading={isViewerLoading}
        disableTranslate={!viewerSource || !currentPageText.trim() || isTranslating}
        statusMessage={statusMessage}
      />
      <main className="flex-1 overflow-hidden bg-[var(--surface-color)] dark:bg-[var(--surface-color-dark)]">
        <SplitLayout>
          <ViewerPane
            source={viewerSource}
            currentPage={currentPage}
            onPageCountChange={handlePageCountChange}
            onPageTextChange={handlePageTextChange}
            onLoadingChange={setIsViewerLoading}
          />
          <TranslationPane
            translation={translation}
            isTranslating={isTranslating}
            error={error}
            fileName={fileName}
            sourceLabel={getSourceLabel(viewerSource, currentPage)}
          />
        </SplitLayout>
      </main>
    </div>
  );
}

export default App;
