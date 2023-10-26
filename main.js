#!/usr/bin/env node
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { COMMANDS, MESSAGE_TYPES } from "./utils/variables.js";
import { isValidRepo } from "./utils/isValidRepo.js";
import { printMessage } from "./utils/printMessage.js";
import { init, commit, add, status } from "./commands/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [_, __, command, param] = process.argv;
const repoFolderPath = path.resolve(__dirname, "");

switch (command) {
  case COMMANDS.INIT:
    init(repoFolderPath);
    break;
  case COMMANDS.COMMIT:
    if (await isValidRepo(repoFolderPath)) {
      commit(repoFolderPath, param);
    } else {
      printMessage("fatal: Not a valid nit repository", MESSAGE_TYPES.NEUTRAL);
    }
    break;

  case COMMANDS.ADD:
    if (await isValidRepo(repoFolderPath)) {
      add(repoFolderPath, path.join(...param.split("/")));
    } else {
      printMessage("fatal: Not a valid nit repository", MESSAGE_TYPES.NEUTRAL);
    }
    break;

  case COMMANDS.STATUS:
    if (await isValidRepo(repoFolderPath)) {
      status(repoFolderPath);
    } else {
      printMessage("fatal: Not a valid nit repository", MESSAGE_TYPES.NEUTRAL);
    }
    break;

  default:
    console.log("Dekh le....");
    break;
}
