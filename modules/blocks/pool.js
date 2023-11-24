import fetch from "node-fetch";
import { setTimeout } from "timers/promises";
import {
  ENV_API_WAIT_TIME,
  ENV_OSU_API_KEY,
  ENV_USE_DATA_MOCK,
} from "../helpers/env.js";

/**
 * @typedef {{
 *  id: string,
 *  isSet: boolean,
 *  pickedBy: string,
 *  modSlot: string,
 *  modEnum: OSU_MOD_ENUM
 * }} UnresolvedMapData [id, isSet, pickedBy, modSlot, modEnum]
 *
 * @typedef {{[mod:string]: UnresolvedMapData[]}} UnresolvedPoolData
 */

/**
 * @param {UnresolvedPoolData} poolToResolve
 */
export async function resolvePool(poolToResolve) {
  /** @type {{[mod:string]: Record<string, any>[]}} */
  const pool = {};

  for (const currentMod in poolToResolve) {
    pool[currentMod] ??= [];

    for (const mapMetaData of poolToResolve[currentMod]) {
      console.log(
        `${currentMod}:${mapMetaData.isSet ? "s" : "b"}/${mapMetaData.id}`,
      );

      const map = await fetchMapData(mapMetaData);

      pool[currentMod].push(resolveMapData(map, mapMetaData));
      if (map == null) console.log("- deleted");

      await setTimeout(ENV_USE_DATA_MOCK ? 0 : ENV_API_WAIT_TIME);
    }
  }

  return pool;
}

/**
 * @param {Record<string,any>} map
 * @param {UnresolvedMapData} metaData
 */
function resolveMapData(map, metaData) {
  const mapData = map ?? {
    deleted: true,
  };

  if (mapData.deleted)
    mapData[metaData.isSet ? "beatmapset_id" : "beatmap_id"] = metaData.id;

  return {
    ...mapData,
    updated_at: Date.now(),
    picked_by: metaData.pickedBy,
    was_set_link: metaData.isSet,

    mod_slot: metaData.modSlot,
    mod_enum: metaData.modEnum,
  };
}

/**
 * @param {UnresolvedMapData} mapMeta
 */
async function fetchMapData(mapMeta) {
  const mapData = await fetchMapJsonData(mapMeta);

  if (!Array.isArray(mapData) || mapData.length < 1)
    // throw Error("API returned nothing");
    return null; // deleted sets/maps return nothing

  if (mapMeta.isSet)
    return mapData.sort((a, b) => b.difficultyrating - a.difficultyrating)[0];

  return mapData[0];
}

/**
 * @param {string} modString
 */
export function resolveModEnum(modString) {
  if (typeof modString !== "string")
    throw TypeError("Mod string is not a string!!!");

  switch (modString.toLowerCase()) {
    case "dt":
      return OSU_MOD_ENUM.DoubleTime;
    case "hr":
      return OSU_MOD_ENUM.HardRock;
    case "hd":
      return OSU_MOD_ENUM.Hidden;
  }

  // nm & tb
  return OSU_MOD_ENUM.None;
}

/**
 * https://github.com/ppy/osu-api/wiki#mods
 * @enum {number}
 */
const OSU_MOD_ENUM = {
  None: 0,
  NoFail: 1,
  Easy: 2,
  TouchDevice: 4,
  Hidden: 8,
  HardRock: 16,
  SuddenDeath: 32,
  DoubleTime: 64,
  Relax: 128,
  HalfTime: 256,
  Nightcore: 512, // Only set along with DoubleTime. i.e: NC only gives 576
  Flashlight: 1024,
  Autoplay: 2048,
  SpunOut: 4096,
  Relax2: 8192, // Autopilot
  Perfect: 16384, // Only set along with SuddenDeath. i.e: PF only gives 16416
  Key4: 32768,
  Key5: 65536,
  Key6: 131072,
  Key7: 262144,
  Key8: 524288,
  FadeIn: 1048576,
  Random: 2097152,
  Cinema: 4194304,
  Target: 8388608,
  Key9: 16777216,
  KeyCoop: 33554432,
  Key1: 67108864,
  Key3: 134217728,
  Key2: 268435456,
  ScoreV2: 536870912,
  Mirror: 1073741824,
};

/**
 * @param {UnresolvedMapData} mapMeta
 */
async function fetchMapJsonData(mapMeta) {
  if (!ENV_OSU_API_KEY) throw new ReferenceError("OSU_API_KEY is undefined");

  const apiURL = new URL("https://osu.ppy.sh/api/get_beatmaps");
  apiURL.searchParams.set("k", ENV_OSU_API_KEY);
  apiURL.searchParams.set("m", "0");
  apiURL.searchParams.set(mapMeta.isSet ? "s" : "b", mapMeta.id);
  apiURL.searchParams.set(
    "mods",
    // ! api returns 0 difficulty rating for hd mods
    mapMeta.modEnum === OSU_MOD_ENUM.Hidden ? "0" : mapMeta.modEnum.toString(),
  );

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
 * @param {UnresolvedPoolData} poolToCount
 */
export function countPoolMaps(poolToCount) {
  let count = 0;
  Object.values(poolToCount).forEach((pool) => {
    count += pool.length;
  });
  return count;
}

/**
 * @param {{[mod:string]: Record<string, any>[]}} pool
 */
export function generateMetaPool(pool) {
  return Object.fromEntries(
    Object.entries(pool).map(([mod, maps]) => [
      mod,
      maps.map((map) => ({
        id: map.beatmap_id,
        set: map.beatmapset_id,
        deleted: !!map.deleted,
        pickedBy: map.picked_by,
        modSlot: mod,
        modEnum: map.mod_enum,
      })),
    ]),
  );
}

/**
 * @param {{[mod:string]: Record<string,any>[]}} resolvedPool
 * @returns {UnresolvedPoolData}
 */
export function convertPoolToUnresolved(resolvedPool) {
  return Object.fromEntries(
    Object.entries(resolvedPool).map(([mod, maps]) => [
      mod,
      maps.map(
        (map) =>
          /** @type {UnresolvedMapData} */ ({
            id:
              map.deleted && map.was_set_link
                ? map.beatmapset_id
                : map.beatmap_id,
            isSet: map.was_set_link,
            pickedBy: map.picked_by,
            modSlot: map.mod_slot,
            modEnum: map.mod_enum,
          }),
      ),
    ]),
  );
}
