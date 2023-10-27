import { Database } from "../lib/Database.js";
import path from "path";
import fs from "fs-extra";
import { Workspace } from "../lib/Workspace.js";
import { printMessage } from "../utils/printMessage.js";
import { MESSAGE_TYPES } from "../utils/variables.js";

export async function log(folderPath) {
  try {
    const workspace = new Workspace(path.resolve(folderPath, "nit"));
    const databasePath = path.resolve(folderPath, "nit", "objects");
    let database = new Database(databasePath);
    let head = (await workspace.readFile("HEAD")).toString("utf8");
    let commits = [];
    while (head !== "root-commit") {
      const commit = await database.loadObject(head);
      commits.push(commit);
      head = commit.parent;
    }
    commits.reverse();
    for (let commit of commits) {
      const splitRegex = />(.*)/;
      const splitResult = commit.author.match(splitRegex);
      const authorInfo = commit.author.substring(0, splitResult.index + 1);
      const timestamp = new Date(parseInt(splitResult[1]));
      printMessage(`\ncommit ${commit.oid}`, MESSAGE_TYPES.INFORMATION);
      printMessage(`Author: ${authorInfo}`);
      printMessage(`Date: ${timestamp}`);
      printMessage(`\n\t${commit.message}`);
    }
  } catch (error) {
    console.log(error);
  }
}
