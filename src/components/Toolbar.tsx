import { useRef, type ChangeEvent } from 'react';
import ThemeToggle from './ThemeToggle';
import type { Theme, ViewMode } from '../types/viewer';

type ToolbarProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onFileSelect: (file: File) => void;
  onTranslate: () => void;
  onCancel: () => void;
  disableTranslate: boolean;
  isTranslating: boolean;
  page: number;
  pageCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canNavigate: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  statusMessage?: string | null;
  fileName?: string;
  isViewerLoading: boolean;
};

const viewModes: { value: ViewMode; label: string }[] = [
  { value: 'both', label: '2ペイン' },
  { value: 'source', label: '原文のみ' },
  { value: 'translation', label: '翻訳のみ' },
];

export function Toolbar({
  theme,
  onThemeChange,
  onFileSelect,
  onTranslate,
  onCancel,
  disableTranslate,
  isTranslating,
  page,
  pageCount,
  onPrevPage,
  onNextPage,
  canNavigate,
  viewMode,
  onViewModeChange,
  statusMessage,
  fileName,
  isViewerLoading,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (file) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            📄 ファイルを選択
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.html,.htm"
            className="sr-only"
            onChange={handleFileChange}
          />
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
            <span className="font-medium text-slate-700 dark:text-slate-200">{fileName ?? 'ファイル未選択'}</span>
            {isViewerLoading ? <span role="status">読み込み中…</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-white p-1 text-xs font-medium shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => onViewModeChange(mode.value)}
                className={`rounded px-2 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${viewMode === mode.value ? 'bg-accent text-white dark:bg-accent-strong' : 'text-slate-600 hover:text-accent dark:text-slate-300'}`}
                aria-pressed={viewMode === mode.value}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <ThemeToggle theme={theme} onToggle={onThemeChange} />
        </div>
      </div>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2" role="group" aria-label="ページ操作">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={!canNavigate || page <= 1}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              前へ
            </button>
            <div className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
              {pageCount > 0 ? `ページ ${page} / ${pageCount}` : 'ページ情報なし'}
            </div>
            <button
              type="button"
              onClick={onNextPage}
              disabled={!canNavigate || (pageCount > 0 && page >= pageCount)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              次へ
            </button>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="翻訳操作">
            <button
              type="button"
              onClick={isTranslating ? onCancel : onTranslate}
              disabled={disableTranslate}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTranslating ? '中止' : '翻訳'}
            </button>
          </div>
        </div>
        <details className="w-full rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto">
          <summary className="cursor-pointer select-none font-medium text-slate-700 dark:text-slate-100">ヘルプ</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>PDF または HTML ファイルを読み込むと原文ペインに表示されます。</li>
            <li>翻訳ボタンは抽出されたテキストに対してモック翻訳を実行します。</li>
            <li>モバイルでは自動的に上下2段レイアウトに切り替わります。</li>
          </ul>
        </details>
      </div>
      {statusMessage ? (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" role="status">
          {statusMessage}
        </div>
      ) : null}
    </header>
  );
}

export default Toolbar;
