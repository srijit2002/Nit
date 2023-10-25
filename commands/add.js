import fs from "fs-extra";
import path from "path";
import { Database } from "../lib/Database.js";
import { Blob } from "../lib/Blob.js";
import { Index } from "../lib/Index.js";
import { Workspace } from "../lib/Workspace.js";

export async function add(folderPath, newFilePath) {
  try {
    const workspace = new Workspace(folderPath);
    const repoPath = path.join(folderPath, "git");
    const databasePath = path.resolve(repoPath, "objects");
    const indexPath = path.resolve(repoPath, "index");
    const filePath = path.resolve(folderPath, newFilePath);
    const database = new Database(databasePath);
    const data = await workspace.readFile(filePath);
    const blob = new Blob(data);
    await database.store(blob);
    const index = new Index(indexPath);
    await index.loadForUpdate();
    index.add(newFilePath, blob.oid, fs.lstatSync(filePath));
    await index.writeUpdates();
  } catch (error) {
    console.log(error);
  }
}
