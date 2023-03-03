/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) return string;
  let result = "";
  let curSize = 0;
  let prevChar;
  for (const char of string) {
    if (char !== prevChar) {
      prevChar = char;
      curSize = 0;
    }
    if (curSize < size) result += char;
    curSize++;
  }
  return result;
}
