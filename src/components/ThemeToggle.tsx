import type { Theme } from '../types/viewer';

type ThemeToggleProps = {
  theme: Theme;
  onToggle: (theme: Theme) => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      onClick={() => onToggle(nextTheme)}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'ライトモードに切り替える' : 'ダークモードに切り替える'}
    >
      <span aria-hidden className="mr-2 text-lg">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
      {theme === 'dark' ? 'ダーク' : 'ライト'}
    </button>
  );
}

export default ThemeToggle;
