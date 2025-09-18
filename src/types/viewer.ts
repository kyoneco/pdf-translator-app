export type ViewerSource =
  | {
      type: 'pdf';
      /** Binary contents of the PDF file. */
      data: Uint8Array;
      name: string;
    }
  | {
      type: 'html';
      /** Raw HTML string loaded from the file. */
      content: string;
      name: string;
    };

export type ViewerPageInfo = {
  currentPage: number;
  totalPages: number;
};
