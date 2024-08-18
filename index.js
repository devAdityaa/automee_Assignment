import { processPdf } from './workers/convertToImages.js';
import { extractTextAndFontSize } from './workers/textExtractor.js';
import { generateImageContents, getCompletion } from './workers/sendToGpt.js';
const pdfPath = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/source/verify.pdf';
const outputDir = '/Users/debadityabanerji/Desktop/Projects/Personal Projects/pdfRequirement/automee_Assignment/pdfImages';

// extractTextAndFontSize(pdfPath).catch(error => {
//     console.error('Error:', error);
// });

// processPdf(pdfPath, outputDir)
const requirements = {
    sectionRequirement: "Ensure that whenever a chart or table is provided showing some data, that the name of information source has been stated.",
    locator: "Locate the name of the information source immediately after or below the chart or table.",
    fontColor: "The font colour for this wording must be black or blackish or gray.",
    fontType: "The font type for this wording must be the standard font type used in the rest of the content.",
    fontSize: "The font size for this wording must be no smaller than the standard font size used in the rest of the content.",
    sys: "At least 2 of the 3 charts match this requirement."
};

const imageContents = generateImageContents(outputDir)
getCompletion(imageContents, requirements)
.then(response=>{
    console.log(response)
})

