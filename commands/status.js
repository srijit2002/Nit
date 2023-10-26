import { Index } from "../lib/Index.js";
import { Workspace } from "../lib/Workspace.js";
import { Blob } from "../lib/Blob.js";
import path from "path";
import sha1 from "js-sha1";
import { loadTree } from "../utils/loadTree.js";
import chalk from "chalk";

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
    console.log("\nChanges to be commited :");
    console.log('\t(use "nit commit <message>..." to commit)\n');
    for (let entry of uncommitedFiles) {
      console.log(entry);
    }
    return true;
  }
  return false;
}

async function lisUntrackedFiles(untrackedFiles = []) {
  console.log("\nUntracked files:");
  console.log('\t(use "nit add <file>..." to include)\n');
  for (let file of untrackedFiles) {
    console.log(chalk.red("\t", file));
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
    console.log("\nChanges not staged for commit:");
    console.log('\t(use "nit add <file>..." to include)\n');
    for (let file of unStagedFiles) {
      console.log(chalk.red("\tmodified: ", file));
    }
    for (let file of entries.keys()) {
      console.log(chalk.red("\tdeleted: ", file));
    }
    isWorkingTreeClean = false;
  }
  if (untrackedFiles.length > 0) {
    await lisUntrackedFiles(untrackedFiles);
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
      console.log("Nothing to commit, working tree clean");
    }
  } catch (error) {
    console.log(error);
  }
}
