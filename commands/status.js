import { Index } from "../lib/Index.js";
import { Workspace } from "../lib/Workspace.js";
import { Blob } from "../lib/Blob.js";
import path from "path";
import sha1 from "js-sha1";

export async function status(folderPath) {
  try {
    const workspace = new Workspace(folderPath);
    const indexPath = path.resolve(folderPath, "git", "index");
    const index = new Index(indexPath);
    await index.loadForUpdate();
    console.log("Untracked files:\n");
    console.log('\t(use "nit add <file>..." to include)');
    let files = await workspace.listFiles();
    const entries = new Map(index.entries);
    for (let file of files) {
      // List untracked files
      if (!entries.has(file)) {
        console.log("? ", file);
      } else {
        const entry = entries.get(file);
        const data = await workspace.readFile(path.resolve(folderPath, file));
        const blob = new Blob(data);
        const asciiBuffer = Buffer.from(blob.toString(), "binary");
        const asciiString = asciiBuffer.toString("binary");
        let content = `${blob.type} ${asciiBuffer.length}\0${asciiString}`;
        if (sha1.hex(content) !== entry.oid) {
          console.log("M ", file);
        }
        entries.delete(file);
      }
    }
    for (let file of entries.keys()) {
      console.log("D ", file);
    }
  } catch (error) {
    console.log(error);
  }
}
