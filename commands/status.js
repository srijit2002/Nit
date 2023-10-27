import { Index } from "../lib/Index.js";
import { Workspace } from "../lib/Workspace.js";
import { Blob } from "../lib/Blob.js";
import path from "path";
import sha1 from "js-sha1";
import { loadTree } from "../utils/loadTree.js";
import chalk from "chalk";
import { printMessage } from "../utils/printMessage.js";
import { MESSAGE_TYPES } from "../utils/variables.js";

async function listUncommitedFiles(folderPath, entries) {
  let uncommitedFiles = [];
  let treeEntries = await loadTree(folderPath);
  for (let [file, entry] of entries) {
    if (treeEntries?.has(file)) {
      if (entry.oid !== treeEntries.get(file)) {
        uncommitedFiles.push(chalk.green("\tmodified: ", file));
      }
    } else {
      uncommitedFiles.push(`\tAdded:  ${file}`);
    }
  }
  if (uncommitedFiles.length > 0) {
    printMessage("\nChanges to be commited :");
    printMessage('\t(use "nit commit <message>..." to commit)\n');
    for (let entry of uncommitedFiles) {
      printMessage(entry);
    }
    return false;
  }
  return true;
}

async function listUntrackedFiles(untrackedFiles = []) {
  printMessage("\nUntracked files:");
  printMessage('\t(use "nit add <file>..." to include)\n');
  for (let file of untrackedFiles) {
    printMessage(`\t${file}`, MESSAGE_TYPES.ERROR);
  }
}

async function listUnstagedAndUntrackedFiles(folderPath, entries, workspace) {
  let isWorkingTreeClean = true;
  let unStagedFiles = [],
    untrackedFiles = [];
  let files = await workspace.listFiles();
  for (let file of files) {
    if (!entries.has(file)) {
      untrackedFiles.push(file);
    } else {
      const entry = entries.get(file);
      const data = await workspace.readFile(path.resolve(folderPath, file));
      const blob = new Blob(data);
      const asciiBuffer = Buffer.from(blob.toString(), "binary");
      const asciiString = asciiBuffer.toString("binary");
      let content = `${blob.type} ${asciiBuffer.length}\0${asciiString}`;
      if (sha1.hex(content) !== entry.oid) {
        unStagedFiles.push(file);
      }
      entries.delete(file);
    }
  }

  if (unStagedFiles.length > 0 || entries.size > 0) {
    printMessage("\nChanges not staged for commit:");
    printMessage('\t(use "nit add <file>..." to include)\n');
    for (let file of unStagedFiles) {
      printMessage(`\tmodified: ${file}`, MESSAGE_TYPES.ERROR);
    }
    for (let file of entries.keys()) {
      printMessage(`\tdeleted: ${file}`, MESSAGE_TYPES.ERROR);
    }
    isWorkingTreeClean = false;
  }
  if (untrackedFiles.length > 0) {
    await listUntrackedFiles(untrackedFiles);
    isWorkingTreeClean = false;
  }
  return isWorkingTreeClean;
}
export async function status(folderPath) {
  try {
    const workspace = new Workspace(folderPath);
    const indexPath = path.resolve(folderPath, "nit", "index");
    const index = new Index(indexPath);
    await index.loadForUpdate();
    let isWorkingTreeClean = true;
    isWorkingTreeClean &= await listUncommitedFiles(
      folderPath,
      new Map(index.entries)
    );
    isWorkingTreeClean &= await listUnstagedAndUntrackedFiles(
      folderPath,
      new Map(index.entries),
      workspace
    );
    if (isWorkingTreeClean) {
      printMessage("Nothing to commit, working tree clean");
    }
  } catch (error) {
    console.log(error);
  }
}
