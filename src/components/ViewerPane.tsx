import { useEffect, useMemo, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, version } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask, TextContent } from 'pdfjs-dist/types/src/display/api';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import type { ViewerSource } from '../types/viewer';

GlobalWorkerOptions.workerSrc = workerSrc;

type ViewerPaneProps = {
  source: ViewerSource | null;
  currentPage: number;
  onPageCountChange: (count: number) => void;
  onPageTextChange: (text: string) => void;
  onLoadingChange?: (loading: boolean) => void;
};

function extractText(content: TextContent): string {
  return content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

export function ViewerPane({
  source,
  currentPage,
  onPageCountChange,
  onPageTextChange,
  onLoadingChange,
}: ViewerPaneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const isPdf = source?.type === 'pdf';

  useEffect(() => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    if (!source) {
      setPdfDocument(null);
      onPageCountChange(0);
      onPageTextChange('');
      return;
    }

    if (source.type === 'pdf') {
      const task = getDocument({ data: source.data });
      onPageTextChange('');
      onLoadingChange?.(true);
      task.promise
        .then((document) => {
          setPdfDocument(document);
          onPageCountChange(document.numPages);
        })
        .catch((error) => {
          console.error('Failed to load PDF', error);
          onPageCountChange(0);
          onPageTextChange('');
        })
        .finally(() => {
          onLoadingChange?.(false);
        });
      return () => {
        task.destroy();
      };
    }

    if (source.type === 'html') {
      setPdfDocument(null);
      onPageCountChange(1);
      onPageTextChange(extractTextFromHtml(source.content));
      if (iframeRef.current) {
        iframeRef.current.srcdoc = source.content;
      }
      onLoadingChange?.(false);
    }
  }, [source, onLoadingChange, onPageCountChange, onPageTextChange]);

  useEffect(() => {
    if (!pdfDocument || !isPdf) {
      return;
    }

    const safePage = Math.min(Math.max(currentPage, 1), pdfDocument.numPages);
    if (safePage !== currentPage) {
      onPageTextChange('');
    }

    const renderPage = async (pageNumber: number) => {
      onLoadingChange?.(true);
      try {
        const page: PDFPageProxy = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = containerRef.current?.clientWidth ?? viewport.width;
        const scale = Math.max(containerWidth / viewport.width, 1);
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
          return;
        }
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
        const task = page.render({ canvasContext: context, viewport: scaledViewport, canvas });
        renderTaskRef.current = task;
        await task.promise;
        const textContent = await page.getTextContent();
        onPageTextChange(extractText(textContent));
      } catch (error) {
        console.error('Failed to render PDF page', error);
        onPageTextChange('');
      } finally {
        onLoadingChange?.(false);
      }
    };

    renderPage(safePage);

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDocument, currentPage, isPdf, onLoadingChange, onPageTextChange]);

  const pdfVersion = useMemo(() => (isPdf ? version : null), [isPdf]);

  return (
    <section className="flex h-full flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3 text-sm font-semibold text-slate-700 dark:border-[var(--panel-border-dark)] dark:text-slate-100">
        原文ビュー
        {pdfVersion ? (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">PDF.js v{pdfVersion}</span>
        ) : null}
      </header>
      <div ref={containerRef} className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-900">
        {!source ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            PDF または HTML ファイルを読み込むとここに表示されます。
          </div>
        ) : isPdf ? (
          <canvas ref={canvasRef} className="mx-auto block max-w-full rounded-md border border-[var(--panel-border)] bg-white shadow-sm dark:border-[var(--panel-border-dark)]" />
        ) : (
          <iframe
            ref={iframeRef}
            title="HTML preview"
            sandbox="allow-same-origin"
            srcDoc={source.content}
            className="h-full w-full rounded-md border border-[var(--panel-border)] bg-white shadow-sm dark:border-[var(--panel-border-dark)]"
          />
        )}
      </div>
    </section>
  );
}

export default ViewerPane;
