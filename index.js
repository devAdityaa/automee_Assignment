import fs from 'fs';
import { processPdfAndEvaluate } from './verifyRequirements.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const pdfPath = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/source/verify.pdf';
const outputDir = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/pdfImages';
const processId = uuidv4();
const requirements = {
    type: process.env.TYPE, 
    sectionRequirement: process.env.SECTION_REQUIREMENT, 
    locator: process.env.LOCATOR,
    fontType: process.env.FONT_TYPE,
    fontSize: process.env.FONT_SIZE,
    fontColor: process.env.FONT_COLOR,
    additionalNotes: process.env.ADDITIONAL_NOTES,
    riskyWords: process.env.RISKY_WORDS
};

async function main() {
    try {
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

        const numImages = pdfDocument.numPages;
        console.log("Pages", numImages);

        await processPdfAndEvaluate(pdfPath, outputDir, processId, requirements, numImages);
        console.log('PDF processed and evaluated successfully.');
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

main();
