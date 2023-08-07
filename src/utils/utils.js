/**
 * 
 * Deep search inside an object for a key that includes the given keyword in its name
 * @param {string} keyword - keyword to find
 * @param {object} obj - object to search
 * @returns {object} - value of the key that contains the keyword
 * 
 */
export function deepFindKeyword(keyword, obj) {
  for (let key in obj) {
    if (key.includes(keyword)) {
      return obj[key];
    }
    if (typeof obj[key] === "object") {
      let result = deepFindKeyword(keyword, obj[key]);
      if (result) {
        return result;
      }
    }
  }
}

/**
 * 
 * Parse the content of the JsonEditorVue component to an object if it is a string or return it if it is already an object
 * @param {object|string} objectOrJsonString - object or string to parse
 * @returns {object} - parsed object
 * 
 */
export function parseJsonEditorContent(objectOrJsonString) {
  if (typeof objectOrJsonString === 'string') {
    return JSON.parse(objectOrJsonString);
  }

  return objectOrJsonString;
}