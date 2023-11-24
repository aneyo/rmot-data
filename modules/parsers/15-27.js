import { MAP_SELECTOR_MATCH } from "../helpers/match.js";
import { parseSchedule } from "../blocks/schedule.js";
import { resolveMapID, resolveSetID } from "../helpers/map.js";
import { resolveModName } from "../blocks/pool.js";
import {
  parse1to14BannerBlock,
  parse1to14LinksBlock,
  parse1to14RanksBlock,
} from "./1-14.js";

const mainSelector =
  ".forum-post:first > .forum-post__body > .forum-post__content .bbcode ";

/**
 * @param {import("cheerio").CheerioAPI} page
 */
export async function parse15to27TemplateData(page) {
  const data = {};

  /* banner */
  data.banner = parse1to14BannerBlock(page);

  /* ranks */
  data.ranks = parse1to14RanksBlock(page);

  /* links */
  data.links = parse1to14LinksBlock(page);

  /* schedule */
  let isScheduleHidden = false; // is post hidden behind spoiler-box

  // wow, #16+ schedule goes without spoiler-box
  const postMainSchedule = page(mainSelector + ".well:nth(6) + center").html();
  isScheduleHidden = postMainSchedule != null;

  const postSchedule =
    postMainSchedule ??
    page(mainSelector + ".bbcode-spoilerbox__body:first").html(); // only on #15

  data.schedule = parseSchedule(postSchedule);

  /* map pool */
  // yeah
  const mapPoolListSelector = isScheduleHidden
    ? ".bbcode-spoilerbox__body:nth(2)"
    : ".bbcode-spoilerbox__body:nth(3)";

  const postMapPool = page(mainSelector + mapPoolListSelector).find(
    "a, u, a + *",
  );

  /** @type {{[mod:string]: [string,string,boolean][]}} */
  const poolToResolve = {};
  let currentMod = "nm";

  for (const item of postMapPool) {
    /**
     * @type {string?}
     * @ts-ignore */
    const itemText = item.children[0]?.data;

    if (item.tagName === "u" && typeof itemText === "string") {
      currentMod = resolveModName(itemText);
      continue;
    }

    if (item.tagName === "a") {
      if (currentMod == null) continue;
      poolToResolve[currentMod] ??= [];

      /**
       * @type {string?}
       * @ts-ignore */
      const nextText = item.next?.data;

      const selectorMatch =
        typeof nextText === "string"
          ? MAP_SELECTOR_MATCH.exec(nextText.trim())
          : undefined;

      const mapID = resolveMapID(item.attribs.href);
      const beatID = mapID ?? resolveSetID(item.attribs.href);
      if (beatID != null)
        poolToResolve[currentMod].push([
          beatID,
          selectorMatch?.groups?.selector ?? "Redavor",
          mapID == null,
        ]);
    }
  }

  data._pool = poolToResolve;

  /* --------------------------------------- */

  return data;
}
