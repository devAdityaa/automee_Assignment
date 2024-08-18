import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { fromPath } from 'pdf2pic';
import sharp from 'sharp';

// Function to convert PDF page to image with footer
async function convertPdfToImagesWithFooter(pdfPath, outputDir) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

    for (let i = 0; i < pdfDocument.numPages; i++) {
        try {
            const page = await pdfDocument.getPage(i + 1);
            const viewport = page.getViewport({ scale: 2 });

            // Convert and add footer to image
            await convertToImages(pdfPath, viewport.width, viewport.height, outputDir, i + 1);
        } catch (e) {
            console.log("Error caught during looping:", e);
        }
    }
}

// Convert PDF page to image and save it with footer
async function convertToImages(pdfPath, width, height, outputDir, pageNumber) {
    const options = {
        density: 100,
        saveFilename: '_',
        savePath: outputDir,
        format: "png",
        width: Math.round(width),
        height: Math.round(height)
    };

    const convert = fromPath(pdfPath, options);

    try {
        const imageInfo = await convert(pageNumber, { responseType: "image" });
        const imagePath = imageInfo.path;

        console.log(`Page ${pageNumber} is now converted as image: ${imagePath}`);

        // Add footer with black background and page number text
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

        const footerHeight = 100; // Height of the footer
        const canvasHeight = height + footerHeight;

        // Create a footer with black background and page number text
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

        console.log(`Footer added to page ${pageNumber}.`);

    } catch (error) {
        console.error('Error adding footer to image:', error);
    }
}

// Main function to execute the conversion and footer addition
export async function processPdf(pdfPath, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    try {
        await convertPdfToImagesWithFooter(pdfPath, outputDir);
        console.log('Processing completed.');
    } catch (error) {
        console.error('Error during processing:', error);
    }
}
