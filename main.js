#!/usr/bin/env node
import { Command } from "commander";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { COMMANDS, MESSAGE_TYPES } from "./utils/variables.js";
import { isValidRepo } from "./utils/isValidRepo.js";
import { printMessage } from "./utils/printMessage.js";
import { init, commit, add, status, config, diff } from "./commands/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoFolderPath = path.resolve(__dirname, "");
const program = new Command();

program
  .name("Nit")
  .description("A simple version control system built using Node JS")
  .version("0.0.0");

program
  .command(COMMANDS.INIT)
  .description("Initialize empty Nit repository")
  .action(async () => {
    await init(repoFolderPath);
    printMessage("Initialized empty nit repository", MESSAGE_TYPES.NEUTRAL);
  });

program
  .command(COMMANDS.ADD)
  .argument("<paths...>", "Space separated file paths")
  .description("Add changes in the working directory to the staging area")
  .action(async (paths) => {
    if (isValidRepo(repoFolderPath)) {
      await add(
        repoFolderPath,
        paths.map((filePath) => path.join(...filePath.split("/")))
      );
    } else {
      printMessage("fatal: Not a valid nit repository", MESSAGE_TYPES.NEUTRAL);
    }
  });

program
  .command(COMMANDS.COMMIT)
  .argument("<message>", "Commit Message")
  .description("Captures a snapshot of the project's currently staged changes")
  .action(async (message) => {
    if (isValidRepo(repoFolderPath)) {
      await commit(repoFolderPath, message);
    } else {
      printMessage("fatal: Not a valid nit repository", MESSAGE_TYPES.NEUTRAL);
    }
  });

program
  .command(COMMANDS.STATUS)
  .description(
    "Displays the state of the working directory and the staging area."
  )
  .action(async () => {
    if (isValidRepo(repoFolderPath)) {
      await status(repoFolderPath);
    } else {
      printMessage("fatal: Not a valid nit repository", MESSAGE_TYPES.NEUTRAL);
    }
  });

program
  .command(COMMANDS.CONFIG)
  .argument("<key>")
  .argument("[value]")
  .description(
    "Displays the state of the working directory and the staging area."
  )
  .action(async (key, value) => {
    await config(repoFolderPath, key, value);
  });

program
  .command(COMMANDS.DIFF)
  .argument("[paths...]", "Space separated file paths")
  .description("Shows changes between the working tree and the index or a tree")
  .action(async (paths) => {
    await diff(repoFolderPath,paths);
  });

program.parse(process.argv);
