export type TranslationInput = {
  text: string;
  sourceType: 'pdf' | 'html';
  sourceName: string;
  pageNumber?: number;
  targetLanguage: string;
};

export type TranslationOptions = {
  signal?: AbortSignal;
};

export interface TranslationService {
  translate(input: TranslationInput, options?: TranslationOptions): Promise<string>;
}
