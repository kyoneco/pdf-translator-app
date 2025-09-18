import { clsx } from 'clsx';

type TranslationPaneProps = {
  translation: string;
  isTranslating: boolean;
  error: string | null;
  fileName?: string;
  sourceLabel?: string;
};

export function TranslationPane({
  translation,
  isTranslating,
  error,
  fileName,
  sourceLabel,
}: TranslationPaneProps) {
  return (
    <section className="flex h-full flex-col bg-white dark:bg-slate-900">
      <header className="border-b border-[var(--panel-border)] px-4 py-3 text-sm font-semibold text-slate-700 dark:border-[var(--panel-border-dark)] dark:text-slate-100">
        翻訳結果
        {fileName ? <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">{fileName}</span> : null}
        {sourceLabel ? <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">{sourceLabel}</span> : null}
      </header>
      <div className="flex-1 overflow-auto bg-white px-4 py-4 text-sm leading-relaxed text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        {isTranslating ? (
          <p className="animate-pulse text-slate-500 dark:text-slate-400">翻訳しています…</p>
        ) : error ? (
          <p className="text-rose-500">{error}</p>
        ) : translation ? (
          <pre
            className={clsx(
              'whitespace-pre-wrap rounded-md border border-[var(--panel-border)] bg-slate-50 p-4 text-xs leading-6 dark:border-[var(--panel-border-dark)] dark:bg-slate-800',
            )}
          >
            {translation}
          </pre>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">翻訳結果がここに表示されます。</p>
        )}
      </div>
    </section>
  );
}

export default TranslationPane;
