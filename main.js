#!/usr/bin/env node
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { COMMANDS } from "./utils/variables.js";

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
    commit(repoFolderPath, param);
    break;

  case COMMANDS.ADD:
    add(repoFolderPath, param);
    break;

  case COMMANDS.STATUS:
    status(repoFolderPath);
    break;

  default:
    break;
}
