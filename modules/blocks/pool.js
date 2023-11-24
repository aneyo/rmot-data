import fetch from "node-fetch";
import { setTimeout } from "timers/promises";
import {
  ENV_API_WAIT_TIME,
  ENV_OSU_API_KEY,
  ENV_USE_DATA_MOCK,
} from "../helpers/env.js";

/**
 * @param {{[mod:string]: [string,string,boolean][]}} poolToResolve
 */
export async function resolvePool(poolToResolve) {
  /** @type {{[mod:string]: Record<string, any>[]}} */
  const pool = {};

  for (const currentMod in poolToResolve) {
    pool[currentMod] ??= [];
    const modFlag = resolvePoolModSlot(currentMod);

    for (const [id, pickedBy, isSet] of poolToResolve[currentMod]) {
      console.log(`${currentMod}:${id}`);
      const map = await fetchMapData(id, modFlag, isSet);

      pool[currentMod].push(resolveMapData(map, id, pickedBy, isSet));
      if (map == null) console.log("- deleted");

      await setTimeout(ENV_USE_DATA_MOCK ? 0 : ENV_API_WAIT_TIME);
    }
  }

  return pool;
}

/**
 * @param {Record<string,any>} map
 * @param {string} id
 * @param {string} pickedBy
 * @param {boolean} isSet
 */
function resolveMapData(map, id, pickedBy, isSet) {
  const mapData = map ?? {
    deleted: true,
  };

  if (map == null) mapData[isSet ? "beatmapset_id" : "beatmap_id"] = id;

  return {
    ...mapData,
    updated_at: Date.now(),
    picked_by: pickedBy,
    was_set_link: isSet,
  };
}

/**
 * @param {string} mapID
 */
async function fetchMapData(mapID, mod, isSet = false) {
  const mapData = await fetchMapJsonData(mapID, mod, isSet);

  if (!Array.isArray(mapData) || mapData.length < 1)
    // throw Error("API returned nothing");
    return null; // deleted sets/maps return nothing

  if (isSet)
    return mapData.sort((a, b) => b.difficultyrating - a.difficultyrating)[0];

  return mapData[0];
}

/**
 * @param {string} modString
 */
function resolvePoolModSlot(modString) {
  if (typeof modString !== "string")
    throw TypeError("Mod string is not a string!!!");

  switch (modString.toLowerCase()) {
    case "dt":
      return OSU_MODS.DoubleTime;
    case "hr":
      return OSU_MODS.HardRock;
  }

  // nm, hd & tb
  // note: api returns 0 difficulty rating for hd mods
  return OSU_MODS.None;
}

// https://github.com/ppy/osu-api/wiki#mods
const OSU_MODS = {
  None: 0,
  Hidden: 8,
  HardRock: 16,
  DoubleTime: 64,
};

async function fetchMapJsonData(id, mods, isSet) {
  if (!ENV_OSU_API_KEY) throw new ReferenceError("OSU_API_KEY is undefined");

  const apiURL = new URL("https://osu.ppy.sh/api/get_beatmaps");
  apiURL.searchParams.set("k", ENV_OSU_API_KEY);
  apiURL.searchParams.set("m", "0");
  apiURL.searchParams.set(isSet ? "s" : "b", id);
  apiURL.searchParams.set("mods", mods);

  const apiRequest = await fetch(apiURL);

  return await apiRequest.json();
}

/**
 * @param {string} modName
 */
export function resolveModName(modName) {
  switch (modName.toLowerCase()) {
    case "no mod":
      return "nm";
    case "hidden":
      return "hd";
    case "hard rock":
      return "hr";
    case "double time":
      return "dt";
    case "free mod": // before #45
      return "fm";
    case "tie breaker": // before #5
    case "tiebreaker":
      return "tb";
  }

  return "na"; // for debugging purpose
}

/**
 * @param {{[mod:string]: [string,string,boolean][]}} poolToCount
 */
export function countPoolMaps(poolToCount) {
  let count = 0;
  Object.values(poolToCount).forEach((pool) => {
    count += pool.length;
  });
  return count;
}

/**
 *
 * @param {{[mod:string]: Record<string, any>[]}} pool
 */
export function generateMetaPool(pool) {
  return Object.fromEntries(
    Object.entries(pool).map(([mod, maps]) => [
      mod,
      maps.map((map) => ({
        mod,
        id: map.beatmap_id,
        set: map.beatmapset_id,
        deleted: !!map.deleted,
        pickedBy: map.picked_by,
      })),
    ]),
  );
}

/**
 * @param {{[mod:string]: Record<string,any>[]}} resolvedPool
 * @returns {{[mod:string]: [string,string,boolean][]}}
 */
export function convertPoolToUnresolved(resolvedPool) {
  return Object.fromEntries(
    Object.entries(resolvedPool).map(([mod, maps]) => [
      mod,
      maps.map((map) => [
        map.deleted && map.was_set_link ? map.beatmapset_id : map.beatmap_id,
        map.picked_by,
        map.was_set_link,
      ]),
    ]),
  );
}
