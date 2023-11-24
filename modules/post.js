import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { utcDate } from "./blocks/schedule.js";
import { FORUM_ID_MATCH, TITLE_MATCH } from "./helpers/match.js";
import { parse1to14TemplateData } from "./parsers/1-14.js";
import { parseCurrentTemplateData } from "./parsers/current.js";
import { parse15to27TemplateData } from "./parsers/15-27.js";
import { ENV_PACKAGE_VERSION } from "./helpers/env.js";

/**
 * @param {string} postURL
 */
export async function parseTournamentPost(postURL) {
  const pageString = await getForumPost(postURL);
  return parseTournamentPostFromString(pageString);
}

/**
 * @param {string} pageString
 */
export async function parseTournamentPostFromString(pageString) {
  const page = cheerio.load(pageString);

  // fetch meta data
  const postURL = page('meta[property="og:url"]').prop("content");
  const postID = getForumPostID(postURL);

  const postCover = page('meta[property="og:image"]').prop("content");
  const postedDate = utcDate(
    page(".forum-topic-title__post-time > time").attr("datetime"),
  ).valueOf();

  const forumPostTitle = extractForumPostName(
    page('meta[property="og:title"]').prop("content"),
  );

  const tournamentIteration = getTournamentIteration(
    page('meta[property="og:title"]').attr("content"),
  );

  const postAuthorElement = page(
    ".forum-post:first > .forum-post-info > .js-usercard",
  );
  const postAuthorID = postAuthorElement.attr("data-user-id");
  const postAuthorName = postAuthorElement.text();

  console.log(`title: ${forumPostTitle}`);
  console.log(`poster: ${postAuthorName} (${postAuthorID})`);

  const templateParser = resolveTemplateVersion(tournamentIteration);
  const data = await templateParser(page);

  return {
    ver: ENV_PACKAGE_VERSION,
    updated: Date.now(),

    forumID: postID,
    tournamentID: tournamentIteration,

    url: postURL,
    postedDate,
    postedBy: {
      id: postAuthorID,
      name: postAuthorName,
    },

    cover: postCover,
    name: forumPostTitle,

    ...data,
  };
}

/**
 * @param {string} urlString
 */
async function getForumPost(urlString) {
  const pageRequest = await fetch(urlString);
  return await pageRequest.text();
}

/**
 * @param {string} urlString
 */
export function getForumPostID(urlString) {
  const idPicker = FORUM_ID_MATCH.exec(urlString);
  return idPicker?.groups?.id;
}

/**
 * @param {string} titleString
 */
export function getTournamentIteration(titleString) {
  const rapidMatch = TITLE_MATCH.exec(titleString);
  return +rapidMatch.groups?.iteration;
}

/**
 * @param {number} iteration
 */
function resolveTemplateVersion(iteration) {
  if (iteration > 0) {
    if (iteration < 15) {
      console.log("using 1-14 template parser.");
      return parse1to14TemplateData;
    } else if (iteration < 28) {
      console.log("using 15-27 template parser.");
      return parse15to27TemplateData;
    }
  }

  console.log("using <current> template parser.");
  return parseCurrentTemplateData;
}

/**
 * @param {string} postTitle
 */
export function extractForumPostName(postTitle) {
  const titleMatch = TITLE_MATCH.exec(postTitle);
  return titleMatch?.[0];
}
