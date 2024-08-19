/**
 * Extracts JSON from a string and parses it.
 * 
 * @param {string} response - The string containing JSON.
 * @returns {Object} - The parsed JSON object, or null if parsing fails.
 */
function extractJsonFromResponse(response) {
    try {
        // Find the JSON part between { and }
        const jsonString = response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1);
        
        // Parse and return the JSON object
        return JSON.parse(jsonString);
    } catch (error) {
        return response;
    }
}

export { extractJsonFromResponse };
