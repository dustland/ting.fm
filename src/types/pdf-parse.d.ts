declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  interface PdfOptions {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }

  function pdf(dataBuffer: Buffer, options?: PdfOptions): Promise<PdfData>;
  export = pdf;
}
