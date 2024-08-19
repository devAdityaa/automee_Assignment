import fs from 'fs';
import path from 'path';
import { processPdf } from './workers/convertToImages.js';
import { generateImageContents, getCompletion } from './workers/sendToGpt.js';

/**
 * Processes a PDF by converting it into images, evaluating the images with GPT, and cleaning up temporary files.
 * 
 * @param {string} pdfPath - The path to the PDF file to process.
 * @param {string} outputDir - The directory to save the converted images.
 * @param {string} processId - The identifier for the current processing task.
 * @param {Object} requirements - The requirements object to evaluate the images against.
 * @param {number} numImages - The number of images to process.
 */
async function processPdfAndEvaluate(pdfPath, outputDir, processId, requirements, numImages) {
    try {
        // Convert the PDF into serialized images with a page number
        await processPdf(pdfPath, outputDir, processId);

        // Send the images to OpenAI for processing
        const imageContents = await generateImageContents(processId, outputDir, numImages);
        const response = await getCompletion(imageContents, requirements);

        console.log(response);

        // Clean up the temporary image files
        fs.readdir(outputDir, (err, files) => {
            if (err) throw err;
            files
                .filter(file => file.startsWith(processId))
                .forEach(file => {
                    const filePath = path.join(outputDir, file);
                    fs.unlink(filePath, err => {
                        if (err) throw err;
                        console.log(`${filePath} was deleted`);
                    });
                });
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

// Example usage
const pdfPath = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/source/verify.pdf';
const outputDir = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/pdfImages';
const processId = '12234454ABnd';
const requirements = {
    sectionRequirement: 'Ensure that none of the risky words are used in the content',
    riskyWords: 'Always, Amazing, Appealing, Assure, Attractive, Best, Big, Certainty, Convenient, Effortless, Excellent, Exceptional, Exclusive, Extraordinary, Granted, Great, Guarantee, High, Highest, Incredible, Insure, Large, Larger, Lower, Major, Most, Never, Only, Outstanding, Promise, Promising, Reassure, Robust, Safe, Safety, Secure, Sole, Solid, Stable, Strong, Superior, Terrific, The one, Tremendous, Unique, Unlimited, Warranty',
    type: "Risky Words"
};
const numImages = 6;

processPdfAndEvaluate(pdfPath, outputDir, processId, requirements, numImages);
