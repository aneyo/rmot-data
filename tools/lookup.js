/* 
  forum posts lookup script:
  look for RMOT posts within N pages and place them in a /state/lookup file
*/

import minimist from "minimist";
import {
  ENV_MAX_PAGE_DEPTH,
  ENV_PACKAGE_VERSION,
  ENV_PAGE_WAIT_TIME,
  ENV_STATE_DIR_PATH,
} from "../modules/helpers/env.js";
import { findPostsOnPage } from "../modules/page.js";
import { expectNumber } from "../modules/helpers/expect.js";
import { ensureDirectory } from "../modules/helpers/dir.js";
import path from "path";
import { ensureFile } from "fs-extra/esm";
import { writeFile } from "fs/promises";
import { setTimeout } from "timers/promises";
import prettyMs from "pretty-ms";

const PRETTY_WAIT_TIME_MESSAGE = prettyMs(ENV_PAGE_WAIT_TIME);

const args = minimist(process.argv.slice(2));

const startingPageNumber = expectNumber(args.p ?? args.page, 0);
const maxPages = expectNumber(args.d ?? args.depth, ENV_MAX_PAGE_DEPTH);

if (startingPageNumber < 0)
  throw Error("Only positive starting page is allowed.");
if (maxPages < 0) throw Error("Only positive max pages number is allowed.");
if (startingPageNumber >= maxPages)
  throw Error(
    `Starting page(${startingPageNumber}) should not be more or equals to the max pages number(${maxPages}).`,
  );

const stateDir = await ensureDirectory(ENV_STATE_DIR_PATH, false);
const lookupFilePath = path.join(stateDir, "lookup");

console.log("starting lookup script:");
console.log(`= version: ${ENV_PACKAGE_VERSION}`);
console.log(`= starting from page: ${startingPageNumber}`);
console.log(`= max pages to lookup: ${maxPages}`);
console.log(`= lookup file: ${lookupFilePath}`);
console.log("=========================");

/** @type {Set<string>} */
const lookupQueue = new Set();

for (let pageNumber = startingPageNumber; pageNumber < maxPages; pageNumber++) {
  console.log(`- page: ${pageNumber}`);

  try {
    const page = await findPostsOnPage(pageNumber);

    if (page.length < 1) {
      throw "this page is empty.";
    }

    console.log(`found ${page.length}:`);
    page.forEach((post) => {
      console.log(`> ${post}`);
      lookupQueue.add(post);
    });
  } catch (error) {
    console.log("skipping this page, cause:");
    console.error(error);
  }

  if (pageNumber + 1 < maxPages && ENV_PAGE_WAIT_TIME > 0) {
    console.log(`waiting for ${PRETTY_WAIT_TIME_MESSAGE}`);
    await setTimeout(ENV_PAGE_WAIT_TIME);
  }
}

console.log("-------------------------");
console.log(`found overall: ${lookupQueue.size}`);
console.log("-------------------------");

try {
  await ensureFile(lookupFilePath);

  await writeFile(lookupFilePath, [...lookupQueue].join("\n"));
  console.log(`+ saved new lookup file: "${lookupFilePath}"`);

  console.log("lookup done.");
} catch (error) {
  console.error(error);
  console.log("lookup done with errors.");
}
