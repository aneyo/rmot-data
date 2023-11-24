import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { TITLE_MATCH } from "./helpers/match.js";
import { ENV_FORUM_URL } from "./helpers/env.js";
import path from "path";
import { readFileOrDefault } from "./helpers/file.js";

/**
 * @param {number} pageNum
 * @param {boolean} [onlyOnce=true]
 */
export async function findPostsOnPage(pageNum, onlyOnce = true) {
  const pageData = await getPageData(pageNum);

  const page = cheerio.load(pageData);
  const entries = page("ul.forum-list__items").find("li.forum-topic-entry");

  /** @type {string[]} */
  const posts = [];

  for (const entry of entries) {
    const post = checkPostEntry(entry);
    if (post !== null) posts.push(post);
    if (posts.length > 0 && onlyOnce) break;
  }

  return posts;
}

/**
 * @param {cheerio.Element} entry
 */
function checkPostEntry(entry) {
  const post = cheerio.load(entry);

  const postTitle = post("a.forum-topic-entry__title").text();
  const isRMOTTitle = TITLE_MATCH.test(postTitle);
  if (!isRMOTTitle) return null;

  const postAuthor = post("a.js-usercard").attr("data-user-id");
  if (!allowedAuthors.includes(postAuthor)) return null;

  // post url
  return post("a.forum-topic-entry__title").attr("href");
}

/**
 * @param {number} pageNum
 */
async function getPageData(pageNum) {
  if (typeof pageNum !== "number")
    throw TypeError("Page number is not a number, wtf?");

  const pageURL = new URL(ENV_FORUM_URL);
  if (pageNum > 0) pageURL.searchParams.set("page", (pageNum + 1).toString());

  const pageResponse = await fetch(pageURL);
  return await pageResponse.text();
}

const allowedAuthors = (
  await readFileOrDefault(path.join(".", "meta", "allowed_authors"), "")
)
  .toString()
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l != "");
