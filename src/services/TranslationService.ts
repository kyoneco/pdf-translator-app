export type TranslationInput = {
  /** Plain text to translate. */
  text: string;
  /** Origin of the text (PDF or HTML). */
  sourceType: 'pdf' | 'html';
  /** Display name of the source file. */
  sourceName: string;
  /** Page number for PDF documents. */
  pageNumber?: number;
  /** Language to translate the text into. */
  targetLanguage: string;
};

export interface TranslationService {
  translate(input: TranslationInput): Promise<string>;
}
