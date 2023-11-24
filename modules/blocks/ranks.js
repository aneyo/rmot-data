import { DESCRIPTION_RANKS_MATCH } from "../helpers/match.js";

/**
 * @param {string} descriptionText
 */
export function getRanksFromDescription(descriptionText) {
  const descriptionMatch = DESCRIPTION_RANKS_MATCH.exec(descriptionText);
  return Object.fromEntries(
    Object.entries(descriptionMatch.groups).map(([k, v]) => [
      k,
      convertRankNames(v),
    ]),
  );
}

/**
 * @param {string?} shortRankString
 */
export function convertRankNames(shortRankString) {
  if (typeof shortRankString !== "string") return NaN;

  if (
    shortRankString.length > 1 &&
    (shortRankString[shortRankString.length - 1] === "k" ||
      shortRankString[shortRankString.length - 1] === "K")
  )
    return +shortRankString.slice(0, -1) * 1000;

  return +shortRankString.replace(",", ""); // #6-14 is using N,NNN format lol
}
