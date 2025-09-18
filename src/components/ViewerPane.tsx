import { useEffect, useMemo, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, version } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask, TextContent } from 'pdfjs-dist/types/src/display/api';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import type { ViewerSource } from '../types/viewer';

const baseUrl = typeof __BASE_URL__ !== 'undefined' ? __BASE_URL__ : import.meta.env.BASE_URL;
const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
const resolvedWorkerSrc = workerSrc.startsWith('http')
  ? workerSrc
  : workerSrc.startsWith(normalizedBase)
    ? workerSrc
    : `${normalizedBase}${workerSrc.startsWith('/') ? workerSrc : `/${workerSrc}`}`;

GlobalWorkerOptions.workerSrc = resolvedWorkerSrc;

type ViewerPaneProps = {
  source: ViewerSource | null;
  currentPage: number;
  onPageCountChange: (count: number) => void;
  onTextExtracted: (text: string) => void;
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
  onTextExtracted,
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
      onTextExtracted('');
      return;
    }

    if (source.type === 'pdf') {
      const task = getDocument({ data: source.data });
      onLoadingChange?.(true);
      onTextExtracted('');
      task.promise
        .then((document) => {
          setPdfDocument(document);
          onPageCountChange(document.numPages);
        })
        .catch((error) => {
          console.error('Failed to load PDF', error);
          setPdfDocument(null);
          onPageCountChange(0);
          onTextExtracted('');
        })
        .finally(() => {
          onLoadingChange?.(false);
        });
      return () => {
        task.destroy();
      };
    }

    setPdfDocument(null);
    onPageCountChange(1);
    const text = extractTextFromHtml(source.content);
    onTextExtracted(text);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = source.content;
    }
    onLoadingChange?.(false);
    return () => undefined;
  }, [source, onLoadingChange, onPageCountChange, onTextExtracted]);

  useEffect(() => {
    if (!pdfDocument || !isPdf) {
      return;
    }

    const safePage = Math.min(Math.max(currentPage, 1), pdfDocument.numPages);

    const renderPage = async (pageNumber: number) => {
      onLoadingChange?.(true);
      try {
        const page: PDFPageProxy = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = containerRef.current?.clientWidth ?? viewport.width;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const scale = Math.max((containerWidth / viewport.width) * 0.98, 1);
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
          return;
        }
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;
        canvas.width = Math.floor(scaledViewport.width * devicePixelRatio);
        canvas.height = Math.floor(scaledViewport.height * devicePixelRatio);
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
        const task = page.render({ canvasContext: context, viewport: scaledViewport, canvas });
        renderTaskRef.current = task;
        await task.promise;
        const textContent = await page.getTextContent();
        onTextExtracted(extractText(textContent));
      } catch (error) {
        if ((error as Error).name !== 'RenderingCancelledException') {
          console.error('Failed to render PDF page', error);
          onTextExtracted('');
        }
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
  }, [pdfDocument, currentPage, isPdf, onLoadingChange, onTextExtracted]);

  const pdfVersion = useMemo(() => (isPdf ? version : null), [isPdf]);

  return (
    <section className="panel" aria-label="原文ビュー">
      <header className="panel__header">
        <div className="flex flex-col">
          <span>原文ビュー</span>
          {source ? (
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{source.name}</span>
          ) : (
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ファイルを選択してください</span>
          )}
        </div>
        {pdfVersion ? (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">PDF.js v{pdfVersion}</span>
        ) : null}
      </header>
      <div ref={containerRef} className="panel__body">
        {!source ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-300" role="status">
            PDF もしくは HTML ファイルを読み込むと表示されます。
          </div>
        ) : isPdf ? (
          <canvas
            ref={canvasRef}
            className="mx-auto block max-w-full rounded-md border border-slate-200 bg-white shadow dark:border-slate-700"
            role="img"
            aria-label={`${source.name} のページ ${currentPage}`}
          />
        ) : (
          <iframe
            ref={iframeRef}
            title="HTML プレビュー"
            sandbox="allow-same-origin"
            className="h-full w-full rounded-md border border-slate-200 bg-white shadow dark:border-slate-700"
            srcDoc={source.content}
          />
        )}
      </div>
    </section>
  );
}

export default ViewerPane;
