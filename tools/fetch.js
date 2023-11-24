/*
  lookup fetch script:
  download new data from /state/lookup
*/

import path from "path";
import {
  ENV_PACKAGE_VERSION,
  ENV_PAGE_WAIT_TIME,
  ENV_POOL_OUTDATED_TIME,
  ENV_PUBLIC_POOL_DIR_PATH,
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
  ENV_STATE_DIR_PATH,
} from "../modules/helpers/env.js";
import { ensureDir, readJSON, writeJSON } from "fs-extra/esm";
import { readFile } from "fs/promises";
import { parseTournamentPost } from "../modules/post.js";
import { setTimeout } from "timers/promises";
import {
  convertPoolToUnresolved,
  countPoolMaps,
  generateMetaPool,
  resolvePool,
} from "../modules/blocks/pool.js";
import { FORUM_ID_MATCH } from "../modules/helpers/match.js";
import { fileExist } from "../modules/helpers/file.js";
import minimist from "minimist";
import prettyMs from "pretty-ms";

const PRETTY_WAIT_TIME_MESSAGE = prettyMs(ENV_PAGE_WAIT_TIME);

const args = minimist(process.argv.slice(2));

const forceFetch = !!(args.f ?? args.force);
const lookupFilePath = path.join(ENV_STATE_DIR_PATH, "lookup");

console.log("starting fetch script:");
console.log(`= version: ${ENV_PACKAGE_VERSION}`);
console.log(`= lookup file: ${lookupFilePath}`);

await ensureDir(ENV_PUBLIC_TOURNAMENTS_DIR_PATH);
await ensureDir(ENV_PUBLIC_POOL_DIR_PATH);

console.log(`= tournaments path: ${ENV_PUBLIC_TOURNAMENTS_DIR_PATH}`);
console.log(`= pool path: ${ENV_PUBLIC_POOL_DIR_PATH}`);
console.log("=========================");

const lookupFileContents = await readFile(lookupFilePath);
const lookupData = Array.from(
  // remove dupes (the easiest method)
  new Set(
    lookupFileContents
      .toString()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== ""), // filter out empty lines
    // ? should i also filter out non-URL ones?
  ),
);

if (forceFetch) console.log("~ FORCE UPDATE IS ON");

// mmm, fancy
const postsMessage = `~ ${lookupData.length} post(s) to fetch`;
console.log(postsMessage);
console.log("~".repeat(postsMessage.length));

/* ---------------------------------------- */

let fetchCount = 0;
const timerStart = process.hrtime();

for (let i = 0; i < lookupData.length; i++) {
  console.log(`- ${lookupData[i]}`);

  const forumIDMatch = FORUM_ID_MATCH.exec(lookupData[i]);
  if (
    forumIDMatch == null ||
    forumIDMatch.groups == null ||
    forumIDMatch.groups.id == null
  ) {
    console.log("cannot find forum id, skipping.");
    continue;
  }

  const dataFileName = `${forumIDMatch.groups.id}.json`;
  const tournamentDataPath = path.join(
    ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
    dataFileName,
  );
  const poolDataPath = path.join(ENV_PUBLIC_POOL_DIR_PATH, dataFileName);

  if (await fileExist(tournamentDataPath)) {
    console.log("tournament data already downloaded.");
    if (!forceFetch) {
      if (await fileExist(poolDataPath)) {
        const poolData = await readJSON(poolDataPath);
        if (
          typeof poolData.updated === "number" &&
          Date.now() >= poolData.updated + ENV_POOL_OUTDATED_TIME
        ) {
          console.log("pool is outdated.");
          const unresolvedPool = convertPoolToUnresolved(poolData.pool);

          console.log(`got ${countPoolMaps(unresolvedPool)} maps to update`);
          const pool = {
            ver: ENV_PACKAGE_VERSION,
            updated: Date.now(),
            pool: await resolvePool(unresolvedPool),
          };
          fetchCount++;

          try {
            await writeJSON(poolDataPath, pool);
            console.log(`+ pool data saved to: ${poolDataPath}`);
          } catch (poolUpdatingError) {
            console.log("cannot update pool, cause:");
            console.error(poolUpdatingError);
          }

          if (i + 1 < lookupData.length && ENV_PAGE_WAIT_TIME > 0) {
            console.log(`waiting for ${PRETTY_WAIT_TIME_MESSAGE}`);
            await setTimeout(ENV_PAGE_WAIT_TIME);
          }
        }
      }
      continue;
    }
    console.log("force updating the tournament data:");
  }

  try {
    const tournament = await parseTournamentPost(lookupData[i]);
    const poolLookup = tournament._pool;
    delete tournament._pool;

    console.log(`got ${countPoolMaps(poolLookup)} maps to fetch:`);
    const pool = {
      ver: ENV_PACKAGE_VERSION,
      updated: Date.now(),
      forumID: tournament.forumID,
      pool: await resolvePool(poolLookup),
    };

    fetchCount++;
    try {
      await writeJSON(tournamentDataPath, {
        ...tournament,
        pool: generateMetaPool(pool.pool),
      });
      console.log(`+ tournament data saved to: ${tournamentDataPath}`);

      await writeJSON(poolDataPath, pool);
      console.log(`+ pool data saved to: ${poolDataPath}`);

      /* --------- */
    } catch (savingError) {
      console.log("cannot save data:");
      console.error(savingError);
    }
  } catch (fetchError) {
    console.log("cannot fetch this post:");
    console.error(fetchError);
  }

  if (i + 1 < lookupData.length && ENV_PAGE_WAIT_TIME > 0) {
    console.log(`waiting for ${PRETTY_WAIT_TIME_MESSAGE}`);
    await setTimeout(ENV_PAGE_WAIT_TIME);
  }
}

console.log("-------------------------");

const timerEnd = process.hrtime(timerStart);
const elapsed = prettyMs(timerEnd[0] * 1000 + timerEnd[1] / 1_000_000);

console.log(`fetch count: ${fetchCount}`);
console.log(`fetch time: ${elapsed}`);

console.log("+++++++++++++++++++++++++");
console.log(`fetch done.`);
