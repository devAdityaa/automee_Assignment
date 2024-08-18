import { processPdf } from './workers/convertToImages.js';
import { extractTextAndFontSize } from './workers/textExtractor.js';

const pdfPath = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/source/verify.pdf';
const outputDir = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/pdfImages';

// extractTextAndFontSize(pdfPath).catch(error => {
//     console.error('Error:', error);
// });

processPdf(pdfPath, outputDir)