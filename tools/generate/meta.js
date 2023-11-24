/* 
  meta files generator
*/
import path from "path";
import {
  ENV_PACKAGE_VERSION,
  ENV_PUBLIC_DIR_PATH,
  ENV_PUBLIC_POOL_DIR_PATH,
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
} from "../../modules/helpers/env.js";
import { readdir, stat } from "fs/promises";
import { readJSON, writeJSON } from "fs-extra/esm";
import { hash } from "hasha";
import { fileExist } from "../../modules/helpers/file.js";

const TOURNEY_LISTING_FILE_PATH = path.join(
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
  "index.json",
);

const POOL_LISTING_FILE_PATH = path.join(
  ENV_PUBLIC_POOL_DIR_PATH,
  "index.json",
);

const ROOT_META_FILE_PATH = path.join(ENV_PUBLIC_DIR_PATH, "meta.json");

async function getIDsFromDir(dir) {
  const files = await readdir(dir, {
    withFileTypes: true,
  });

  return files
    .map((e) =>
      e.isFile() && e.name !== "index.json"
        ? +e.name.replace(".json", "")
        : null,
    )
    .filter((e) => e != null && !isNaN(e));
}

async function calculateDirHash(dir) {
  const files = await readdir(dir, {
    withFileTypes: true,
  });

  const modifiedTimes = [];
  for (let i = 0; i < files.length; i++) {
    if (files[i].name.toLocaleLowerCase() == "index.json") continue;
    const fileStat = await stat(path.join(dir, files[i].name));
    modifiedTimes.push(fileStat.mtime);
  }

  return await hash(
    modifiedTimes
      .map((d) => BigInt(d.valueOf()))
      .reduce((a, b) => a + b)
      .toString(),
    { algorithm: "md5" },
  );
}

async function getDataFromListingFile(listingFilePath) {
  if (!(await fileExist(listingFilePath))) return null;
  const listingFile = await readJSON(listingFilePath);
  return listingFile;
}

console.log("starting meta files generator:");
console.log(`= tournaments listing: ${TOURNEY_LISTING_FILE_PATH}`);
console.log(`= pool listing: ${POOL_LISTING_FILE_PATH}`);
console.log(`= root meta file: ${ROOT_META_FILE_PATH}`);
console.log("==============================");

const lastTourneyData = await getDataFromListingFile(TOURNEY_LISTING_FILE_PATH);
const lastPoolData = await getDataFromListingFile(POOL_LISTING_FILE_PATH);
const lastMetaData = await getDataFromListingFile(ROOT_META_FILE_PATH);

console.log(`~ last tournament listing hash: ${lastTourneyData?.hash}`);
console.log(`~ last pool listing hash: ${lastPoolData?.hash}`);
console.log(`~ last meta hash: ${lastMetaData?.hash}`);

console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

let latestTourneyID = lastTourneyData?.latest ?? -1;
let latestPoolID = lastPoolData?.latest ?? -1;

const currentTourneyHash = await calculateDirHash(
  ENV_PUBLIC_TOURNAMENTS_DIR_PATH,
);

if (currentTourneyHash !== lastTourneyData?.hash) {
  console.log("- generating tourney meta file");
  console.log(`hash: ${currentTourneyHash}`);

  try {
    const tourneyIDs = await getIDsFromDir(ENV_PUBLIC_TOURNAMENTS_DIR_PATH);
    latestTourneyID = Math.max(...tourneyIDs);

    await writeJSON(TOURNEY_LISTING_FILE_PATH, {
      version: ENV_PACKAGE_VERSION,
      latest: latestTourneyID.toString(),
      updated: Date.now(),
      listing: tourneyIDs.map((id) => id.toString()),
      hash: currentTourneyHash,
    });

    console.log(`+ saved tournaments meta file: ${TOURNEY_LISTING_FILE_PATH}`);
  } catch (error) {
    console.log("cannot generate tournaments meta file, cause:");
    console.error(error);
  }
} else {
  console.log("tournament listing hashes are equal, nothing to update.");
}

const currentPoolHash = await calculateDirHash(ENV_PUBLIC_POOL_DIR_PATH);

if (currentPoolHash !== lastPoolData?.hash) {
  console.log("- generating pools meta file");
  console.log(`hash: ${currentPoolHash}`);

  try {
    const poolIDs = await getIDsFromDir(ENV_PUBLIC_POOL_DIR_PATH);
    latestPoolID = Math.max(...poolIDs);

    await writeJSON(POOL_LISTING_FILE_PATH, {
      version: ENV_PACKAGE_VERSION,
      latest: latestPoolID.toString(),
      updated: Date.now(),
      listing: poolIDs.map((id) => id.toString()),
      hash: currentPoolHash,
    });

    console.log(`+ saved pools meta file: ${POOL_LISTING_FILE_PATH}`);
  } catch (error) {
    console.log("cannot generate pools meta file, cause:");
    console.error(error);
  }
} else {
  console.log("pool listing hashes are equal, nothing to update.");
}

const currentMetaHash = await hash(currentTourneyHash + currentPoolHash, {
  algorithm: "md5",
});

if (currentMetaHash !== lastMetaData?.hash) {
  console.log("- generating root meta file");
  console.log(`hash: ${currentMetaHash}`);

  if (latestPoolID != latestTourneyID)
    console.warn(
      `! LATEST ID MISMATCH(P:${latestPoolID} vs T:${latestTourneyID}), USING THE "LATEST" ONE !`,
    );

  const latestForumID = Math.max(latestPoolID, latestTourneyID);

  try {
    await writeJSON(ROOT_META_FILE_PATH, {
      version: ENV_PACKAGE_VERSION,
      updated: Date.now(),
      latest: latestForumID.toString(),
      hash: currentMetaHash,
    });

    console.log(`+ saved root meta file: ${ROOT_META_FILE_PATH}`);
  } catch (error) {
    console.log("cannot generate root meta file, cause:");
    console.error(error);
  }
} else {
  console.log("meta hashes are equal, nothing to update.");
}

console.log("-------------------------");
console.log("meta generation done.");
