import fs from 'fs';
import path from 'path';
import { processPdf } from './workers/convertToImages.js';
import { generateImageContents, getCompletion } from './workers/sendToGpt.js';
import { extractJsonFromResponse } from './workers/extractJson.js';


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

        // Create Base64 Image encodings for the pdf images
        const imageContents = await generateImageContents(processId, outputDir, numImages);
        console.log("PDF Images along with system prompt and requirements sent to GPT API for processing...")

        //send the image encodings along with the prompt and requirements to Openai API
        const response = await getCompletion(imageContents, requirements);

        //Extract the returned JSON Object
        const jsonObject = extractJsonFromResponse(response);
        console.log(jsonObject)

        // Clean up the temporary image files
        fs.readdir(outputDir, (err, files) => {
            if (err) throw err;
            files
                .filter(file => file.startsWith(processId))
                .forEach(file => {
                    const filePath = path.join(outputDir, file);
                    fs.unlink(filePath, err => {
                        if (err) throw err;
                    });
                });
            console.log("All the relevant images to this call deleted")
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

export { processPdfAndEvaluate }