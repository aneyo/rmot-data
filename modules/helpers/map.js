import { MAP_ID_MATCH, SET_ID_MATCH } from "./match.js";

/**
 * @param {string} mapLink
 */
export function resolveMapID(mapLink) {
  const mapIDMatch = MAP_ID_MATCH.exec(mapLink);
  return mapIDMatch?.groups?.id;
}

/**
 * @param {string} setLink
 */
export function resolveSetID(setLink) {
  const setIDMatch = SET_ID_MATCH.exec(setLink);
  return setIDMatch?.groups?.id;
}
