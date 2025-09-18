import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import SplitPane, { type Props as SplitPaneProps } from 'react-split-pane';
import type { ViewMode } from '../types/viewer';

const MOBILE_BREAKPOINT = 768;

const SplitPaneComponent = SplitPane as unknown as ComponentType<PropsWithChildren<SplitPaneProps>>;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    update(mediaQuery);
    const listener = (event: MediaQueryListEvent) => update(event);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return isMobile;
}

type SplitLayoutProps = {
  children: [ReactNode, ReactNode];
  viewMode: ViewMode;
};

export function SplitLayout({ children, viewMode }: SplitLayoutProps) {
  const isMobile = useIsMobile();
  const split = isMobile ? 'horizontal' : 'vertical';

  const content = useMemo(() => {
    if (viewMode === 'source') {
      return <div className="h-full">{children[0]}</div>;
    }
    if (viewMode === 'translation') {
      return <div className="h-full">{children[1]}</div>;
    }
    return null;
  }, [children, viewMode]);

  useEffect(() => {
    if (viewMode !== 'both') {
      return;
    }
    const resizers = document.querySelectorAll<HTMLDivElement>('.split-pane .Resizer');
    resizers.forEach((resizer) => {
      resizer.setAttribute('role', 'separator');
      resizer.setAttribute('tabindex', '0');
      resizer.setAttribute('aria-orientation', isMobile ? 'horizontal' : 'vertical');
    });
  }, [isMobile, viewMode]);

  if (content) {
    return content;
  }

  return (
    <div
      className="h-full"
      role="group"
      aria-label={split === 'vertical' ? '原文と翻訳の幅を調整' : '原文と翻訳の高さを調整'}
    >
      <SplitPaneComponent
        key={split}
        split={split}
        defaultSize="50%"
        minSize={isMobile ? 180 : 240}
        allowResize
        className="split-pane"
        resizerClassName="Resizer"
      >
        {children[0]}
        {children[1]}
      </SplitPaneComponent>
    </div>
  );
}

export default SplitLayout;
