import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { Database } from "../lib/Database.js";
import { Entry } from "../lib/Entry.js";
import { Tree } from "../lib/Tree.js";
import { Author } from "../lib/Author.js";
import { Commit } from "../lib/Commit.js";
import { Refs } from "../lib/Refs.js";
import { Index } from "../lib/Index.js";

dotenv.config();

function isExec(p) {
  return !!(fs.statSync(p).mode & fs.constants.S_IXUSR);
}
export async function commit(folderPath, message) {
  try {
    const repoPath = path.resolve(folderPath, "git");
    const indexPath = path.resolve(repoPath, "index");
    const databasePath = path.resolve(repoPath, "objects");
    let database = new Database(databasePath);
    const index = new Index(indexPath);
    index.loadForUpdate();
    const refs = new Refs(repoPath);
    const parent = await refs.readHead();
    const entries = [];
    for (let [absolutePath, entry] of index.entries) {
      entries.push(
        new Entry(path.basename(absolutePath), entry.oid, isExec(absolutePath))
      );
    }
    const root = Tree.build(entries);
    root.traverse((tree) => database.store(tree));
    const authorName = process.env.GIT_AUTHOR_NAME;
    const authorEmail = process.env.GIT_AUTHOR_EMAIL;
    const author = new Author(authorName, authorEmail, Date.now());
    const commit = new Commit(parent, root.oid, author.toString(), message);
    await database.store(commit);
    await refs.updateHead(commit.oid);
  } catch (error) {
    console.log(error);
  }
}
