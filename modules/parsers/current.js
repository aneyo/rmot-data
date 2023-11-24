import { getRanksFromDescription } from "../blocks/ranks.js";
import { resolvePostLinks } from "../blocks/links.js";
import { parseSchedule } from "../blocks/schedule.js";
import { MAP_SELECTOR_MATCH } from "../helpers/match.js";
import { resolveModEnum, resolveModName } from "../blocks/pool.js";
import { resolveMapID, resolveSetID } from "../helpers/map.js";

const mainSelector =
  ".forum-post:first > .forum-post__body > .forum-post__content .bbcode ";

/**
 * @param {import("cheerio").CheerioAPI} page
 */
export async function parseCurrentTemplateData(page) {
  const data = {};

  /* banner */
  data.banner = page(mainSelector + "center:first img").attr("src");

  /* description(ranks) */
  const postDescription = page(mainSelector + ".well:nth(1)").text();
  data.ranks = { ...getRanksFromDescription(postDescription) };

  /* links */
  const postLinks = page(mainSelector + ".well:nth(5)").find(
    'a[rel="nofollow"]',
  );
  data.links = resolvePostLinks(postLinks.toArray().map((l) => l.attribs.href));

  /* schedule */
  const postSchedule = page(mainSelector + ".well:nth(6) center:last").html();
  data.schedule = parseSchedule(postSchedule);

  /* map pool */
  const postMapPool = page(
    mainSelector + ".well:nth(9) .js-spoilerbox > .bbcode-spoilerbox__body",
  ).find("a, u, a + *");

  /** @type {import("../blocks/pool.js").UnresolvedPoolData} */
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
        poolToResolve[currentMod].push({
          id: beatID,
          isSet: mapID == null, // will resolve map from set id if is true
          pickedBy: selectorMatch?.groups?.selector ?? "Redavor",
          modEnum: resolveModEnum(currentMod),
          modSlot: currentMod,
        });
      else
        console.warn(
          `cannot get id from: ${currentMod} > ${item.attribs.href}`,
        );
    }
  }

  data._pool = poolToResolve;

  /* --------------------------------------- */

  return data;
}
