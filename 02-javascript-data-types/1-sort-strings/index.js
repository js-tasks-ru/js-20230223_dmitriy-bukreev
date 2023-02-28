/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  // Assuming `arr` to be a flat array
  const result = [...arr];

  if (param === "asc") return result.sort(compareStrings);
  else if (param === "desc")
    return result.sort((a, b) => -compareStrings(a, b));
}

function compareStrings(a, b) {
  return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
}
