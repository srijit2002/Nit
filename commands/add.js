import fs from "fs-extra";
import path from "path";
import { Database } from "../lib/Database.js";
import { Blob } from "../lib/Blob.js";
import { Index } from "../lib/Index.js";
import { Workspace } from "../lib/Workspace.js";

export async function add(folderPath, paths = []) {
  try {
    const workspace = new Workspace(folderPath);
    const repoPath = path.join(folderPath, "nit");
    const databasePath = path.resolve(repoPath, "objects");
    const indexPath = path.resolve(repoPath, "index");
    const index = new Index(indexPath);
    const database = new Database(databasePath);
    await index.loadForUpdate();

    for (let newFilePath of paths) {
      const filePath = path.resolve(folderPath, newFilePath);
      if (workspace.exists(newFilePath)) {
        const data = await workspace.readFile(filePath);
        const blob = new Blob(data);
        await database.store(blob);
        index.add(newFilePath, blob.oid, fs.lstatSync(filePath));
      } else {
        //
      }
      await index.writeUpdates();
    }
  } catch (error) {
    console.log(error);
  }
}
