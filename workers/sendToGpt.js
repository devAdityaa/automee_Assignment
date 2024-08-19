import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI // Ensure environment variable is set
});

async function encodeImage(imagePath) {
    try {
        const image = await fs.promises.readFile(imagePath);
        return image.toString('base64');
    } catch (error) {
        console.error(`Error encoding image at ${imagePath}:`, error);
    }
}

async function generateImageContents(id, dirPath, count) {
    try {
        let contents = [];
        for (let i = 1; i <= count; i++) {
            const imagePath = path.resolve(dirPath, `${id}.${i}.png`);
            const base64Image = await encodeImage(imagePath);
            const base64ImageUrl = `data:image/jpeg;base64,${base64Image}\n`;
            contents.push({
                type: 'image_url',
                image_url: {
                    url: base64ImageUrl
                }
            });
        }
        return contents;
    } catch (error) {
        console.error('Error generating image contents:', error);
    }
}

async function getCompletion(contents, requirements) {
    try {
        let requirementsText = '';
        // Construct requirements text based on available fields
        if (requirements.sectionRequirement) requirementsText += `1. Section or Wording Requirement: ${requirements.sectionRequirement}\n`;
        if (requirements.locator) requirementsText += `2. Location: ${requirements.locator}\n`;
        if (requirements.fontColor) requirementsText += `3. Display - Font Color: ${requirements.fontColor}\n`;
        if (requirements.fontType) requirementsText += `4. Display - Font Type: ${requirements.fontType}\n`;
        if (requirements.fontSize) requirementsText += `5. Display - Font Size: ${requirements.fontSize}\n`;
        if (requirements.additional) requirementsText += `System Information: ${requirements.sys}\n`;
        if (requirements.riskyWords) requirementsText += `Risky Words: ${requirements.riskyWords}\n`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: `Instructions: You are provided with a set of images, each representing a page from a PDF document. Your task is to evaluate the content of these images against a specific set of requirements. Your output should be a JSON object formatted as follows: - result: An object where each key is the given requirement name, and the corresponding value is an array: 1. The first element of the array is a boolean (true if the requirement is met, false if not). 2. If the requirement is not met, the second element is a string explaining why it was not met, referencing the correct page number. - final_verdict: A summary string providing a conclusion about whether the PDF as a whole meets the specified requirements. Core Rules: 1. The output must exclusively contain the JSON object, with no additional text or comments. 2. When referencing the PDF and its requirements, use the correct page number, located at the bottom of each page in a black background.\nThe type of the requirement: ${requirements.type}, Given Requirements: ${requirementsText}`
                    },
                        ...contents
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

export {
    generateImageContents,
    getCompletion
};
