import sha1 from "js-sha1";
import fs from "fs-extra";
import path from "path";
import zlib from "zlib";
import { Blob } from "./Blob.js";
import { Tree } from "./Tree.js";
import { Commit } from "./Commit.js";

export class Database {
  TYPES = {
    blob: Blob,
    tree: Tree,
    commit: Commit,
  };
  constructor(databasePath) {
    this.databasePath = databasePath;
  }
  getPath(oid) {
    return path.resolve(this.databasePath, oid.substr(0, 2), oid.substr(2));
  }
  async writeObject(oid, content) {
    try {
      let objectPath = this.getPath(oid);
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
  parse(data) {
    const regex = /(\S+) (\d+)\0([\s\S]*)/;
    const match = data.match(regex);
    if (match) {
      const type = match[1];
      const size = parseInt(match[2]);
      const content = match[3];
      return [type, size, content];
    } else {
      console.log("String format does not match the expected pattern");
      return [];
    }
  }
  async loadObject(oid) {
    try {
      const data = zlib
        .inflateSync(fs.readFileSync(this.getPath(oid)))
        .toString("utf8");
      const [type, size, content] = this.parse(data);
      const obj = this.TYPES[type].parse(content);
      obj.oid = oid;
      return obj;
    } catch (error) {
      console.log(error);
      return {};
    }
  }
}
