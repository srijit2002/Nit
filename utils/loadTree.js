import path from "path";
import { Workspace } from "../lib/Workspace.js";
import { Database } from "../lib/Database.js";
import { Tree } from "../lib/Tree.js";

async function printTree(database, relativePath, oid, entries) {
  const tree = await database.loadObject(oid);
  for (let [file, entry] of tree.entries) {
    let obj = await database.loadObject(entry.oid);
    const currentPath = path.join(relativePath, file);
    if (obj instanceof Tree) {
      await printTree(database, currentPath, obj.oid, entries);
    } else {
      entries.set(currentPath, obj.oid);
    }
  }
}

export async function loadTree(folderPath) {
  try {
    const repoPath = path.resolve(folderPath, "nit");
    const database = new Database(path.resolve(repoPath, "objects"));
    const workspace = new Workspace(repoPath);
    if (!workspace.exists("Head")) return;
    const headOid = (await workspace.readFile("Head")).toString("utf8");
    const commit = await database.loadObject(headOid);
    let entries = new Map();
    await printTree(database, "", commit.tree, entries);
    return entries;
  } catch (error) {
    console.log(error);
  }
}
