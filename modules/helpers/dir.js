import { ensureDir } from "fs-extra";
import path from "path";

export async function ensureDirectory(dirName, isPathRelative = true) {
  const dirPath = isPathRelative
    ? path.join(path.resolve("."), dirName)
    : dirName;
  await ensureDir(dirPath);
  return dirPath;
}
