import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';

/**
 * Extracts text and font size from a PDF document.
 * @param {string} pdfPath - The path to the PDF file.
 */
export async function extractTextAndFontSize(pdfPath) {
    try {
        // Load the PDF document
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
        console.log("Total pages:", pdfDocument.numPages);
        
        for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
            const page = await pdfDocument.getPage(pageIndex);
            const textContent = await page.getTextContent();
            let initFS = 0;
            textContent.items.forEach(item => {
                // Extract text and font size
                const text = item.str;
                const font = item.fontName;
                const fontSize = item.transform[0]; // Approximate font size
                if (fontSize > initFS) {
                    console.log(text, Math.round(fontSize), font);
                    initFS = fontSize;
                } else if (fontSize <= initFS) {
                    console.log(text);
                    initFS = fontSize;
                }
            });
        }
    } catch (error) {
        console.error('Error extracting text and font size:', error);
    }
}
