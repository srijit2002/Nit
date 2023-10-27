import { printMessage } from "../utils/printMessage.js";
import { getPatch } from "fast-array-diff";
import { DIFF_TYPES, MESSAGE_TYPES } from "../utils/variables.js";
import { Workspace } from "../lib/Workspace.js";
import { Index } from "../lib/Index.js";
import path from "path";
import { Blob } from "../lib/Blob.js";
import { Database } from "../lib/Database.js";
import sha1 from "js-sha1";

function formatDiff(oldData, newData) {
  const formatted = [];
  const patches = getPatch(oldData, newData);
  patches.forEach(({ type, oldPos, newPos, items }) => {
    if (type === DIFF_TYPES.ADDED) {
      for (let _ of items) {
        formatted.push({ type, index: newPos++ });
      }
    } else {
      for (let _ of items) {
        formatted.push({ type, index: oldPos++ });
      }
    }
  });
  return formatted;
}
async function listUnstagedFiles(entries, workspace, database) {
  let unStagedFiles = [];
  let files = await workspace.listFiles();
  for (let file of files) {
    if (entries.has(file)) {
      const entry = entries.get(file);
      const data = await workspace.readFile(file);
      const blob = new Blob(data);
      const asciiBuffer = Buffer.from(blob.toString(), "binary");
      const asciiString = asciiBuffer.toString("binary");
      let content = `${blob.type} ${asciiBuffer.length}\0${asciiString}`;
      if (sha1.hex(content) !== entry.oid) {
        unStagedFiles.push({
          name: file,
          data: [
            (await database.loadObject(entry.oid)).data.split("\n"),
            data.toString("utf8").split("\n"),
          ],
        });
      }
    }
  }
  return unStagedFiles;
}
function printDiff(diffs, fileName, oldData, newData) {
  printMessage(`\n@@ ${fileName} @@`);
  for (let { type, index } of diffs) {
    if (type === DIFF_TYPES.ADDED) {
      printMessage(`+ ${newData[index]}`, MESSAGE_TYPES.SUCCESS);
    } else if (type === DIFF_TYPES.REMOVED) {
      printMessage(`- ${oldData[index]}`, MESSAGE_TYPES.ERROR);
    } else {
      printMessage(newData[index]);
    }
  }
}

export async function diff(repoFolderPath, filePath) {
  try {
    const folderPath = path.resolve(repoFolderPath, "nit");
    let database = new Database(path.resolve(folderPath, "objects"));
    const workspace = new Workspace(repoFolderPath);
    const indexPath = path.resolve(folderPath, "index");
    const index = new Index(indexPath);
    await index.loadForUpdate();
    const unStagedFiles = await listUnstagedFiles(
      new Map(index.entries),
      workspace,
      database
    );
    for (let unstagedFile of unStagedFiles) {
      const diff = formatDiff(...unstagedFile.data);
      printDiff(
        diff,
        unstagedFile.name,
        unstagedFile.data[0],
        unstagedFile.data[1]
      );
    }
  } catch (error) {
    console.log(error);
  }
}
