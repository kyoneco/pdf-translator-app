import * as Switch from '@radix-ui/react-switch';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { clsx } from 'clsx';

export type Theme = 'light' | 'dark';

type ThemeToggleProps = {
  theme: Theme;
  onToggle: (theme: Theme) => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
      <SunIcon aria-hidden className="h-4 w-4" />
      <Switch.Root
        checked={isDark}
        onCheckedChange={(checked) => onToggle(checked ? 'dark' : 'light')}
        className={clsx(
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          isDark
            ? 'bg-[var(--accent-color-dark)] shadow-inner'
            : 'bg-slate-300 shadow-inner dark:bg-slate-600',
        )}
      >
        <Switch.Thumb
          className={clsx(
            'block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform duration-200',
            isDark ? 'translate-x-[22px]' : 'translate-x-1',
          )}
        />
      </Switch.Root>
      <MoonIcon aria-hidden className="h-4 w-4" />
    </label>
  );
}

export default ThemeToggle;
