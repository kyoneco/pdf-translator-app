import { useCallback, useRef, useState } from 'react';
import type { TranslationInput, TranslationService } from '../services/TranslationService';

type UseTranslationResult = {
  translation: string;
  isTranslating: boolean;
  error: string | null;
  translate: (input: TranslationInput) => Promise<void>;
  cancel: () => void;
  reset: () => void;
};

const ABORT_ERROR = 'AbortError';

export function useTranslation(service: TranslationService): UseTranslationResult {
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsTranslating(false);
  }, []);

  const translate = useCallback(
    async (input: TranslationInput) => {
      cancel();
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsTranslating(true);
      setError(null);
      try {
        const result = await service.translate(input, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setTranslation(result);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === ABORT_ERROR) {
          return;
        }
        setError(err instanceof Error ? err.message : '翻訳に失敗しました。');
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setIsTranslating(false);
        }
      }
    },
    [cancel, service],
  );

  const reset = useCallback(() => {
    cancel();
    setTranslation('');
    setError(null);
  }, [cancel]);

  return {
    translation,
    isTranslating,
    error,
    translate,
    cancel,
    reset,
  };
}
