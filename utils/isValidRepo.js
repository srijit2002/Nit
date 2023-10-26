import path from "path";
import fs from "fs-extra";
import { printMessage } from "./printMessage.js";
import { MESSAGE_TYPES } from "./variables.js";

export async function isValidRepo(folderPath) {
  try {
    const repoPath = path.resolve(folderPath, "nit");
    return (
      (await fs.exists(path.resolve(repoPath, "objects"))) &&
      (await fs.exists(path.resolve(repoPath, "refs")))
    );
  } catch (error) {
    printMessage(error.message, MESSAGE_TYPES.ERROR);
  }
}
