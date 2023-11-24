import {
  RANK_BUFFER_MATCH,
  TITLE_MATCH,
  MAP_SELECTOR_MATCH,
} from "../helpers/match.js";
import { convertRankNames } from "../blocks/ranks.js";
import { resolvePostLinks } from "../blocks/links.js";
import { parseSchedule } from "../blocks/schedule.js";
import { resolveMapID, resolveSetID } from "../helpers/map.js";
import { resolveModName } from "../blocks/pool.js";

const mainSelector =
  ".forum-post:first > .forum-post__body > .forum-post__content .bbcode ";

/**
 * @param {import("cheerio").CheerioAPI} page
 */
export async function parse1to14TemplateData(page) {
  const data = {};

  /* banner */
  data.banner = parse1to14BannerBlock(page);

  /* ranks */
  data.ranks = parse1to14RanksBlock(page);

  /* links */
  data.links = parse1to14LinksBlock(page);

  /* schedule */
  const postSchedule = page(
    mainSelector + ".bbcode-spoilerbox__body:first",
  ).html();

  data.schedule = parseSchedule(postSchedule);

  /* map pool */
  const postMapPool = page(
    mainSelector + ".bbcode-spoilerbox__body:nth(3)",
  ).find("a, u, a + *");

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
          // 1-4 does not have any map selectors visible
          selectorMatch?.groups?.selector ?? "Redavor",
          // resolve by set instead (thank you for using set links)
          mapID == null,
        ]);
    }
  }

  data._pool = poolToResolve;

  /* ---------------------------------- */

  return data;
}

/**
 * @param {import("cheerio").CheerioAPI} page
 */
export function parse1to14RanksBlock(page) {
  // hi-low ranks
  const postTitle = page('meta[property="og:title"]').attr("content");
  const postTitleMatch = TITLE_MATCH.exec(postTitle);

  // muH
  // no buffer until #5
  const wholeFuckingTextPage = page(mainSelector).text();
  const rankBufferMatch = RANK_BUFFER_MATCH.exec(wholeFuckingTextPage); // yes, fuck off

  return {
    buffer: convertRankNames(rankBufferMatch?.groups?.buffer) || 0,
    high: convertRankNames(postTitleMatch?.groups?.hrank) || -1,
    low: convertRankNames(postTitleMatch?.groups?.lrank) || -1,
  };
}

/**
 * @param {import("cheerio").CheerioAPI} page
 */
export function parse1to14LinksBlock(page) {
  const postLinks = page(mainSelector).find('a[rel="nofollow"]');
  return resolvePostLinks(postLinks.toArray().map((l) => l.attribs.href));
}

export function parse1to14BannerBlock(page) {
  return page(mainSelector + "center:first > span > span > img").attr("src");
}
