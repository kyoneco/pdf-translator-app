export type Theme = 'light' | 'dark';

export type ViewerSource =
  | {
      type: 'pdf';
      data: Uint8Array;
      name: string;
    }
  | {
      type: 'html';
      content: string;
      name: string;
    };

export type ViewMode = 'both' | 'source' | 'translation';

export type ViewerPageInfo = {
  page: number;
  totalPages: number;
};
