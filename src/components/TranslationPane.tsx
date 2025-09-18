import type { ReactNode } from 'react';

type TranslationPaneProps = {
  translation: string;
  isTranslating: boolean;
  error: string | null;
  fileName?: string;
  sourceLabel?: string;
  onClear: () => void;
};

function StatusMessage({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-white/60 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-200">{children}</p>;
}

export function TranslationPane({ translation, isTranslating, error, fileName, sourceLabel, onClear }: TranslationPaneProps) {
  return (
    <section className="panel" aria-label="翻訳結果">
      <header className="panel__header">
        <div className="flex flex-col">
          <span>翻訳結果</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {fileName ? `${fileName}${sourceLabel ? ` / ${sourceLabel}` : ''}` : 'ファイル未選択'}
          </span>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200"
          onClick={onClear}
          disabled={!translation && !error}
        >
          クリア
        </button>
      </header>
      <div className="panel__body">
        {error ? (
          <StatusMessage>{error}</StatusMessage>
        ) : isTranslating ? (
          <StatusMessage>翻訳中です…</StatusMessage>
        ) : translation ? (
          <article className="space-y-3 text-sm leading-relaxed text-slate-800 dark:text-slate-100" aria-live="polite">
            {translation.split('\n').map((block, index) => (
              <p key={index}>{block}</p>
            ))}
          </article>
        ) : (
          <StatusMessage>翻訳結果がここに表示されます。</StatusMessage>
        )}
      </div>
    </section>
  );
}

export default TranslationPane;
