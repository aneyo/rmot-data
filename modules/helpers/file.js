import { access, readFile } from "fs/promises";

/**
 * @param {string} filePath
 * @param {T} fileDefault
 * @template {any} T
 */
export async function readFileOrDefault(filePath, fileDefault) {
  try {
    return await readFile(filePath);
  } catch {
    return fileDefault;
  }
}

/**
 * @param {string} filePath
 */
export async function fileExist(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
