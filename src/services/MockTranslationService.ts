import type { TranslationOptions, TranslationService, TranslationInput } from './TranslationService';

const DELAY_MS = 800;

export class MockTranslationService implements TranslationService {
  async translate(input: TranslationInput, options: TranslationOptions = {}): Promise<string> {
    const { signal } = options;
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      const timer = setTimeout(() => {
        const trimmed = input.text.slice(0, 100);
        resolve(`(モック訳) ${trimmed}${input.text.length > 100 ? '…' : ''}`);
      }, DELAY_MS);

      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    });
  }
}
