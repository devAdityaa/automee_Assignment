import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { fromPath } from 'pdf2pic';
import sharp from 'sharp';
import { map } from 'async';

// Function to convert PDF page to image with footer
async function convertPdfToImagesWithFooter(pdfPath, outputDir, id) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
    const numPages = pdfDocument.numPages;

    const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);
    
    await map(pageNumbers, async (pageNumber) => {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        await convertToImages(pdfPath, viewport.width, viewport.height, outputDir, pageNumber, id);
    }, { concurrency: 4 });
}

// Convert PDF page to image and save it with footer
async function convertToImages(pdfPath, width, height, outputDir, pageNumber, id) {
    const options = {
        density: 100,
        saveFilename: id,
        savePath: outputDir,
        format: "png",
        width: Math.round(width),
        height: Math.round(height)
    };

    const convert = fromPath(pdfPath, options);

    try {
        const imageInfo = await convert(pageNumber, { responseType: "image" });
        const imagePath = imageInfo.path;
        await addFooterToImage(imagePath, pageNumber);
    } catch (err) {
        console.error(`Error converting page ${pageNumber} to image:`, err);
    }
}

// Add footer with black background and page number text to an image
async function addFooterToImage(imagePath, pageNumber) {
    try {
        const image = sharp(imagePath);
        const { width, height } = await image.metadata();
        const footerHeight = 100;
        const canvasHeight = height + footerHeight;

        const footerSvg = `
            <svg width="${width}" height="${footerHeight}">
                <rect width="100%" height="100%" fill="black"/>
                <text x="50%" y="50%" font-size="48" fill="white" font-weight="bolder" text-anchor="middle" dominant-baseline="middle">
                    Page ${pageNumber}
                </text>
            </svg>`;

        const footerBuffer = Buffer.from(footerSvg);

        await sharp({
            create: {
                width: width,
                height: canvasHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            }
        })
        .composite([
            { input: await image.toBuffer() },
            { input: footerBuffer, top: height, left: 0 }
        ])
        .toFile(imagePath);
    } catch (error) {
        console.error('Error adding footer to image:', error);
    }
}

// Main function to execute the conversion and footer addition
export async function processPdf(pdfPath, outputDir, id) {
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        await convertPdfToImagesWithFooter(pdfPath, outputDir, id);
        console.log('PDF pages converted to images and a footer is added with the page number...');
    } catch (error) {
        console.error('Error during processing:', error);
    }
}
