/*
  readme files renderer:
  render readme.md files inside (hardcoded) dirs
*/
import path from "path";
import {
  ENV_PUBLIC_DIR_PATH,
  ENV_PUBLIC_POOL_DIR_PATH,
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
  ENV_TEMPLATES_DIR_PATH,
} from "../../modules/helpers/env.js";
import { readJSON } from "fs-extra/esm";
import { readFile, writeFile } from "fs/promises";
import ejs from "ejs";

const tourneysListingPath = path.join(
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
  "index.json",
);
const poolsListingPath = path.join(ENV_PUBLIC_POOL_DIR_PATH, "index.json");
const tourneyTemplatePath = path.join(ENV_TEMPLATES_DIR_PATH, "tournament.md");
const tourneyReadmePath = path.join(ENV_PUBLIC_DIR_PATH, "readme.md");

console.log("starting readme.md files generator script:");
console.log(`= latest tourney template: ${tourneyTemplatePath}`);
console.log(`= latest tourney readme: ${tourneyReadmePath}`);
console.log(`= tournaments listing: ${tourneysListingPath}`);
console.log(`= pools listing: ${poolsListingPath}`);
console.log("==========================================");

const tournamentListing = await readJSON(tourneysListingPath);
const poolsListing = await readJSON(poolsListingPath);

const latestTournamentID = tournamentListing.latest;
if (typeof latestTournamentID !== "string")
  throw TypeError("Latest tournament ID is not a string.");

const latestPoolID = poolsListing.latest;
const idMismatch = latestTournamentID !== latestPoolID;
if (idMismatch)
  console.warn(
    `! LATEST POOL AND TOURNAMENT ID MISMATCH(${latestPoolID} vs ${latestTournamentID}), WILL TRY TO USE TOURNAMENT ID AS A POOL ID !`,
  );

const latestTourneyPath = path.join(
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
  `${latestTournamentID}.json`,
);
const latestPoolPath = path.join(
  ENV_PUBLIC_POOL_DIR_PATH,
  `${idMismatch ? latestTournamentID : latestPoolID}.json`,
);

console.log(`~ latest tourney: ${latestTourneyPath}`);
console.log(`~ latest pool: ${latestPoolPath}`);

console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

const templateData = {
  tournament: await readJSON(latestTourneyPath),
  pool: await (async function () {
    try {
      return await readJSON(latestPoolPath);
    } catch (error) {
      console.log("cannot read pool file, cause:");
      console.error(error);
    }
  })(),

  /* functions */
  getUTCTime(timestamp) {
    return new Date(timestamp).toUTCString().replace("GMT", "UTC");
  },
  resolveSlot(mod) {
    switch (mod) {
      case "nm":
        return 0;
      case "hd":
        return 8;
      case "hr":
        return 16;
      case "dt":
        return 64;
      case "fm":
      case "tb":
        return "freemod";
    }
  },
  generateDownloadLink(map, linkType) {
    switch (linkType) {
      case 0:
        return `osu://b/${map.beatmap_id}`;
      case 1:
        return `https://beatconnect.io/b/${map.beatmapset_id}`;
      case 2:
        return `https://api.nerinyan.moe/d/${map.beatmapset_id}`;
      case 3:
        return `https://api.chimu.moe/v1/download/${map.beatmapset_id}`;
      case 4:
        return `https://osu.ppy.sh/beatmapset/${map.beatmapset_id}`;
    }
    return "#";
  },
  getLinks() {
    return [
      { name: "Forum Post", url: this.tournament.url },
      ...Object.entries(this.tournament.links).map(([key, url]) => ({
        name: this.resolveLinkName(key),
        url,
      })),
    ];
  },
  resolveLinkName(linkKey) {
    switch (linkKey) {
      case "twitch":
        return "Stream";
      case "challonge":
        return "Bracket";
      case "discord":
        return "Discord Server";
    }
    if (linkKey.length < 3) return linkKey;
    return linkKey[0].toUpperCase() + linkKey.slice(1);
  },
};

console.log("- reading template file");
const templateFile = await readFile(tourneyTemplatePath);

console.log("- rendering template file");
const finalReadmeFile = ejs.render(templateFile.toString(), templateData);

await writeFile(tourneyReadmePath, finalReadmeFile);
console.log(`+ saved readme file: ${tourneyReadmePath}`);

console.log("-------------------------");
console.log("readme rendering done.");
