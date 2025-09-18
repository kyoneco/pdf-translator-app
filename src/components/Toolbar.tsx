import { useRef, type ChangeEvent } from 'react';
import { FileTextIcon, ReloadIcon } from '@radix-ui/react-icons';
import { clsx } from 'clsx';
import ThemeToggle, { type Theme } from './ThemeToggle';

type ToolbarProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onFileSelect: (file: File) => void;
  fileName?: string;
  page: number;
  pageCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canNavigate: boolean;
  onTranslate: () => void;
  isTranslating: boolean;
  isViewerLoading: boolean;
  disableTranslate: boolean;
  statusMessage?: string | null;
};

export function Toolbar({
  theme,
  onThemeChange,
  onFileSelect,
  fileName,
  page,
  pageCount,
  onPrevPage,
  onNextPage,
  canNavigate,
  onTranslate,
  isTranslating,
  isViewerLoading,
  disableTranslate,
  statusMessage,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      event.target.value = '';
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--panel-border)] bg-[var(--toolbar-bg)] px-4 py-3 shadow-sm backdrop-blur-sm dark:border-[var(--panel-border-dark)]">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={triggerFileDialog}
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-[var(--accent-color)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
        >
          <FileTextIcon aria-hidden className="h-4 w-4" />
          <span>ファイルを開く</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.html,.htm"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="min-w-0 flex-1 text-xs text-slate-600 dark:text-slate-300">
          {fileName ? (
            <p className="truncate font-medium">{fileName}</p>
          ) : (
            <p className="truncate">PDF または HTML ファイルを読み込んでください。</p>
          )}
          {statusMessage ? <p className="mt-0.5 truncate text-rose-500">{statusMessage}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!canNavigate || page <= 1 || isViewerLoading}
            className={clsx(
              'rounded-md border px-2 py-1 transition',
              !canNavigate || page <= 1 || isViewerLoading
                ? 'cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60',
            )}
          >
            前へ
          </button>
          <span className="tabular-nums text-xs text-slate-600 dark:text-slate-300">
            {pageCount > 0 ? `${page} / ${pageCount}` : '-- / --'}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canNavigate || page >= pageCount || isViewerLoading}
            className={clsx(
              'rounded-md border px-2 py-1 transition',
              !canNavigate || page >= pageCount || isViewerLoading
                ? 'cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60',
            )}
          >
            次へ
          </button>
        </div>

        <button
          type="button"
          onClick={onTranslate}
          disabled={disableTranslate || isViewerLoading}
          className={clsx(
            'inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 dark:bg-slate-700',
            disableTranslate || isViewerLoading
              ? 'cursor-not-allowed opacity-60'
              : 'hover:bg-slate-800 dark:hover:bg-slate-600',
          )}
        >
          {isTranslating && <ReloadIcon className="h-4 w-4 animate-spin" />}
          <span>{isTranslating ? '翻訳中…' : 'このページを翻訳'}</span>
        </button>

        <ThemeToggle theme={theme} onToggle={onThemeChange} />
      </div>
    </header>
  );
}

export default Toolbar;
