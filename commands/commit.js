import fs from "fs-extra";
import path from "path";
import { Database } from "../lib/Database.js";
import { Entry } from "../lib/Entry.js";
import { Tree } from "../lib/Tree.js";
import { Author } from "../lib/Author.js";
import { Commit } from "../lib/Commit.js";
import { Refs } from "../lib/Refs.js";
import { Index } from "../lib/Index.js";
import { parseConfig } from "../utils/parseConfig.js";
import { Workspace } from "../lib/Workspace.js";
import { printMessage } from "../utils/printMessage.js";

function isExec(p) {
  return !!(fs.statSync(p).mode & fs.constants.S_IXUSR);
}
const REGULAR_MODE = "100644";
const EXECUTABLE_MODE = "100755";
export async function commit(folderPath, message) {
  try {
    const repoPath = path.resolve(folderPath, ".nit");
    const workspace = new Workspace(path.resolve(repoPath));
    if (!workspace.exists("config")) {
      printMessage(`*** Please tell me who you are.
      Run
        nit config user.email "you@example.com"
        nit config user.name "Your Name"`);
      return;
    }
    const config = parseConfig(
      fs
        .readFileSync(path.resolve(folderPath, ".nit", "config"))
        .toString("utf8")
    );

    const authorName = config?.user?.name;
    const authorEmail = config?.user?.email;
    if (!authorName || !authorEmail) {
      printMessage(`*** Please tell me who you are.`);
      printMessage(`\tRun`);
      if (!authorName) {
        printMessage(`\t   nit config user.name "Your Name"`);
      } if(!authorEmail) {
        printMessage(`\t   nit config user.email "you@example.com"`);
      }

      return;
    }
    const indexPath = path.resolve(repoPath, "index");
    const databasePath = path.resolve(repoPath, "objects");
    let database = new Database(databasePath);
    const index = new Index(indexPath);
    await index.loadForUpdate();
    const refs = new Refs(repoPath);
    const parent = await refs.readHead();
    const entries = [];
    for (let [absolutePath, entry] of index.entries) {
      entries.push(
        new Entry(
          absolutePath,
          entry.oid,
          isExec(absolutePath) ? EXECUTABLE_MODE : REGULAR_MODE
        )
      );
    }
    const root = Tree.build(entries);
    root.traverse((tree) => database.store(tree));
    const author = new Author(authorName, authorEmail, Date.now());
    const commit = new Commit(parent, root.oid, author.toString(), message);
    await database.store(commit);
    await refs.updateHead(commit.oid);
    printMessage(commit.toString());
  } catch (error) {
    console.log(error);
  }
}
