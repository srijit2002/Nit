import path from "path";
import { Database } from "../lib/Database.js";
import { Blob } from "../lib/Blob.js";
import { Index } from "../lib/Index.js";
import { Workspace } from "../lib/Workspace.js";
import { printMessage } from "../utils/printMessage.js";
import { MESSAGE_TYPES } from "../utils/variables.js";

async function addDirectories(workspace, relativePath, database, index) {
  try {
    if (workspace.isFile(relativePath)) {
      const data = await workspace.readFile(relativePath);
      const blob = new Blob(data);
      await database.store(blob);
      index.add(relativePath, blob.oid, workspace.stat(relativePath));
    } else {
      let files = await workspace.listFiles(relativePath);
      for (let file of files) {
        await addDirectories(workspace, file, database, index);
      }
    }
  } catch (error) {
    printMessage(error.message, MESSAGE_TYPES.ERROR);
  }
}

export async function add(folderPath, paths = []) {
  try {
    const workspace = new Workspace(folderPath);
    const repoPath = path.join(folderPath, ".nit");
    const databasePath = path.resolve(repoPath, "objects");
    const indexPath = path.resolve(repoPath, "index");
    const index = new Index(indexPath);
    const database = new Database(databasePath);
    await index.loadForUpdate();

    for (let newFilePath of paths) {
      if (workspace.exists(newFilePath)) {
        await addDirectories(workspace, newFilePath, database, index);
      } else {
        index.remove(newFilePath);
      }
      await index.writeUpdates();
    }
  } catch (error) {
    console.log(error);
  }
}
