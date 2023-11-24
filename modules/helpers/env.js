import path from "path";
import { readJSON } from "fs-extra/esm";
import {
  expectBoolFromString,
  expectDurationFromString,
  expectNumberFromString,
  expectPathFromString,
  expectString,
} from "./expect.js";

export const ENV_USE_DATA_MOCK = expectBoolFromString(
  process.env.DATA_MOCK,
  false,
);

export const ENV_OSU_API_KEY = expectString(process.env.OSU_API_KEY, null);

export const ENV_FORUM_URL = expectString(
  process.env.FORUM_URL,
  "https://osu.ppy.sh/community/forums/55",
);

export const ENV_MAX_PAGE_DEPTH = expectNumberFromString(
  process.env.MAX_PAGE_DEPTH,
  3,
);

export const ENV_API_WAIT_TIME = expectDurationFromString(
  process.env.API_WAIT_TIME,
  "1.3s",
);

export const ENV_PAGE_WAIT_TIME = expectDurationFromString(
  process.env.PAGE_WAIT_TIME,
  "5s",
);

export const ENV_PUBLIC_DIR_PATH = expectPathFromString(
  process.env.PUBLIC_DIR_PATH,
  "./public",
);

export const ENV_PUBLIC_TOURNAMENTS_DIR_PATH = path.join(
  ENV_PUBLIC_DIR_PATH,
  "tournaments",
);

export const ENV_PUBLIC_POOL_DIR_PATH = path.join(ENV_PUBLIC_DIR_PATH, "pool");

export const ENV_STATE_DIR_PATH = expectPathFromString(
  process.env.STATE_DIR_PATH,
  "./state",
);

export const ENV_TEMPLATES_DIR_PATH = expectPathFromString("./templates");

export const ENV_PACKAGE_VERSION = await (async function () {
  try {
    const pack = await readJSON("./package.json");
    if (typeof pack !== "object" || typeof pack.version != "string") throw null;
    return pack.version;
  } catch {
    throw Error("Cannot read package.json version.");
  }
})();

export const ENV_POOL_OUTDATED_TIME = expectDurationFromString(
  process.env.POOL_OUTDATED_TIME,
  "7d",
);
