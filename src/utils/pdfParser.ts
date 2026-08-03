import * as pdfjsLib from 'pdfjs-dist';

// Set worker CDN for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts raw plain text from all pages of a PDF file in the browser.
 */
export async function parsePdfFileToText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== 'string') continue;
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
          if (!pageText.endsWith('\n')) {
            pageText += '\n';
          }
        } else if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' ';
        }
        pageText += item.str;
        if (item.hasEOL && !pageText.endsWith('\n')) {
          pageText += '\n';
        }
        if (currentY !== null) lastY = currentY;
      }

      fullText += `--- Page ${i} ---\n` + pageText + '\n\n';
    }

    return fullText.trim();
  } catch (err) {
    console.warn('PDF client-side text extraction failed, fallback will be used:', err);
    return '';
  }
}
