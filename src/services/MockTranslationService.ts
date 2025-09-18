import type { TranslationInput, TranslationService } from './TranslationService';

const MOCK_LATENCY_MS = 600;

export class MockTranslationService implements TranslationService {
  async translate({ text, pageNumber, sourceName, targetLanguage }: TranslationInput): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

    const header = `【Mock翻訳: ${targetLanguage.toUpperCase()}】`;
    const pageLine = typeof pageNumber === 'number' ? `ページ: ${pageNumber}` : null;

    return [
      header,
      `ファイル: ${sourceName}`,
      pageLine,
      '',
      text,
      '',
      '※ この結果はモックです。実際の翻訳APIと置き換えてください。',
    ]
      .filter(Boolean)
      .join('\n');
  }
}
