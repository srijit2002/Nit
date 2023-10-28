import { Workspace } from "../lib/Workspace.js";
import { Database } from "../lib/Database.js";
import path from "path";
import { printMessage } from "../utils/printMessage.js";
import { MESSAGE_TYPES } from "../utils/variables.js";

async function restoreAllFiles(obj, workspace, relativePath, database) {
  try {
    if (obj.type === "blob") {
      await workspace.ensureFile(relativePath);
      await workspace.writeFile(relativePath, obj.data);
      printMessage(`${relativePath} has been restored successfully`);
    } else {
      for (let [fileName, entry] of obj.entries) {
        const curObj = await database.loadObject(entry.oid);
        await restoreAllFiles(
          curObj,
          workspace,
          path.join(relativePath, fileName),
          database
        );
      }
    }
  } catch (error) {
    printMessage(error.message, MESSAGE_TYPES.ERROR);
  }
}

export async function checkout(folderPath, filePaths = [], _commitId) {
  try {
    const repoPath = path.resolve(folderPath, "nit");
    const workspace = new Workspace(folderPath);
    const database = new Database(path.resolve(repoPath, "objects"));
    let commitId =
      _commitId || (await workspace.readFile("nit/HEAD")).toString("utf8");
    printMessage(commitId + "\n");
    const commitTreeOid = (await database.loadObject(commitId)).tree;
    const commitTree = await database.loadObject(commitTreeOid);

    for (let file of filePaths) {
      let obj = commitTree;
      const rootToFilePath = file.split(path.sep);
      let isValidFile = true;
      for (let filePath of rootToFilePath) {
        if (obj.entries.has(filePath)) {
          obj = await database.loadObject(obj.entries.get(filePath).oid);
        } else {
          isValidFile = false;
          break;
        }
      }
      if (isValidFile) {
        restoreAllFiles(obj, workspace, file, database);
      } else {
        printMessage(`${file} is not the part of commit`);
      }
    }
  } catch (error) {
    printMessage(error.message, MESSAGE_TYPES.INFORMATION);
  }
}
