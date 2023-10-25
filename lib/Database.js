import sha1 from "js-sha1";
import fs from "fs-extra";
import path from "path";
import zlib from "zlib";

export class Database {
  constructor(databasePath) {
    this.databasePath = databasePath;
  }
  async writeObject(oid, content) {
    try {
      let objectPath = path.resolve(
        this.databasePath,
        oid.substr(0, 2),
        oid.substr(2)
      );
      const isExists = await fs.exists(objectPath);
      if (!isExists) {
        const compressed = zlib.deflateSync(content);
        await fs.outputFile(objectPath, compressed);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async store(obj) {
    const asciiBuffer = Buffer.from(obj.toString(), "binary");
    const asciiString = asciiBuffer.toString("binary");
    let content = `${obj.type} ${asciiBuffer.length}\0${asciiString}`;
    obj.oid = sha1.hex(content);
    await this.writeObject(obj.oid, content);
  }
}
