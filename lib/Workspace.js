import fs from "fs-extra";
import path from "path";
import { IGNORE_LIST } from "../utils/variables.js";

export class Workspace {
  constructor(path) {
    this.path = path;
  }
  async listFiles(folderPath = null) {
    const absoluteFolderPath = path.resolve(this.path, folderPath || "");
    const files = [];
    try {
      const entries = await fs.readdir(absoluteFolderPath);
      for (let entry of entries) {
        if (!IGNORE_LIST.includes(entry)) {
          const filePath = folderPath ? path.join(folderPath, entry) : entry;
          if (this.isFile(filePath)) {
            files.push(filePath);
          } else {
            const res = await this.listFiles(filePath);
            files.push(res);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      return files.flat();
    }
  }
  async readFile(filePath) {
    return await fs.readFile(path.resolve(this.path, filePath));
  }
  isFile(filePath) {
    return fs.lstatSync(path.resolve(this.path, filePath)).isFile();
  }
  exists(filePath) {
    return fs.existsSync(path.resolve(this.path, filePath));
  }
  async appendFile(filePath, content) {
    await fs.appendFile(path.resolve(this.path, filePath), content);
  }
  async writeFile(filePath, content) {
    await fs.writeFile(path.resolve(this.path, filePath), content);
  }
  async ensureFile(filePath) {
    await fs.ensureFile(path.resolve(this.path, filePath));
  }
  stat(filePath) {
    return fs.lstatSync(path.resolve(this.path, filePath));
  }
}
