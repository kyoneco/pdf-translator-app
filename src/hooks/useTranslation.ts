import { useCallback, useState } from 'react';
import type { TranslationInput, TranslationService } from '../services/TranslationService';

type UseTranslationResult = {
  translation: string;
  isTranslating: boolean;
  error: string | null;
  translate: (input: TranslationInput) => Promise<void>;
  reset: () => void;
};

export function useTranslation(service: TranslationService): UseTranslationResult {
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (input: TranslationInput) => {
      setIsTranslating(true);
      setError(null);
      try {
        const result = await service.translate(input);
        setTranslation(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '翻訳に失敗しました。');
      } finally {
        setIsTranslating(false);
      }
    },
    [service],
  );

  const reset = useCallback(() => {
    setTranslation('');
    setError(null);
  }, []);

  return {
    translation,
    isTranslating,
    error,
    translate,
    reset,
  };
}
