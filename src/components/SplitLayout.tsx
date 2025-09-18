import type { PropsWithChildren } from 'react';
import Split from 'react-split';
import { clsx } from 'clsx';
import './split.css';

type SplitLayoutProps = PropsWithChildren<{
  gutterSize?: number;
  minSize?: number | number[];
  className?: string;
}>;

export function SplitLayout({
  children,
  gutterSize = 8,
  minSize = [240, 240],
  className,
}: SplitLayoutProps) {
  return (
    <Split
      className={clsx('split h-full w-full', className)}
      sizes={[50, 50]}
      minSize={minSize}
      gutterSize={gutterSize}
      snapOffset={24}
    >
      {children}
    </Split>
  );
}

export default SplitLayout;
