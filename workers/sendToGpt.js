import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI // Replace with your OpenAI API key
});

// Function to encode image to base64
function encodeImage(imagePath) {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
}

// Function to generate image content for OpenAI API
function generateImageContents(dirPath, count) {
    let contents = [];
    for (let i = 1; i <= count; i++) {
        const imagePath = path.resolve(dirPath, `_.${i}.png`);
        const base64Image = encodeImage(imagePath);
        const base64ImageUrl = `data:image/jpeg;base64,${base64Image}\n`; 
        contents.push({
            type: 'image_url',
            image_url: {
                url: base64ImageUrl
            }
        });
    }
    return contents;
}

// Function to get completion from OpenAI API
async function getCompletion(contents, requirements) {
    try {
        let requirementsText = '';
        if (requirements.sectionRequirement) requirementsText += `1. Section or Wording Requirement: ${requirements.sectionRequirement}\n`;
        if (requirements.locator) requirementsText += `2. Location: ${requirements.locator}\n`;
        if (requirements.fontColor) requirementsText += `3. Display - Font Color: ${requirements.fontColor}\n`;
        if (requirements.fontType) requirementsText += `4. Display - Font Type: ${requirements.fontType}\n`;
        if (requirements.fontSize) requirementsText += `5. Display - Font Size: ${requirements.fontSize}\n`;
        if (requirements.additional) requirementsText += `System Information: ${requirements.sys}\n`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        ...contents,
                        {
                            type: 'text',
                            text: `You are given a PDF document that needs to be evaluated against a set of specified requirements. Your task is to verify if the PDF meets each requirement and output the results as a JSON object. The JSON object should have a 'result' key containing an object where each key corresponds to a requirement number, and the associated value is an array:\n\n- The first element of the array should be a boolean indicating whether the requirement is met ('true' if met, 'false' if not).\n- If the requirement is not met, the second element should be a string explaining why it was not met.\n\nIn addition to the 'result', the JSON object should include a 'final_verdict' key. This key should contain a summary verdict string about the PDF, such as 'All requirements met', 'Some requirements not met', or 'PDF does not meet the requirements'. The output must only contain the JSON object and nothing else. Aditionally, you should reference the correct page number while referring to pages in the pdf. The page number of each page is given at the bottom in a solid dark background.\n\nFor example, the output should look like:\n\n{ 'result': { '1': [false, 'reason'], '2': [true] }, 'final_verdict': 'Some requirements not met' }\n\nRequirements:\n${requirementsText}\n\nPlease evaluate the PDF based on these criteria and provide the JSON output with the 'final_verdict'.\n\nnote: for determining the font size or font family, omit the text decorations like bold or italics.`
                        }
                    ]
                }
            ],
            max_tokens: 300,
            temperature: 0.1
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error making the request:', error);
    }
}

// Export functions for external use
export {
    generateImageContents,
    getCompletion
};
