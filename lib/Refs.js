import path from "path";
import fs from "fs-extra";

export class Refs {
  constructor(pathname) {
    this.pathname = pathname;
    this.headPath = path.resolve(pathname, "HEAD");
  }
  async updateHead(oid) {
    await fs.writeFile(this.headPath, oid);
  }
  async readHead() {
    try {
      if (await fs.exists(this.headPath)) {
        const fileData = await fs.readFile(this.headPath);
        return fileData;
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }
}
