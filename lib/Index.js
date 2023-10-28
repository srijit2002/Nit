import fs from "fs-extra";
import sha1 from "js-sha1";
import bufferpack from "bufferpack";

function isExec(stat) {
  return !!(stat.mode & fs.constants.S_IXUSR);
}

export class IndexEntry {
  static REGULAR_MODE = 0o100644;
  static EXECUTABLE_MODE = 0o100755;
  static MAX_PATH_SIZE = 0xfff;
  static ENTRY_FORMAT = "8I40sHS";
  static ENTRY_BLOCK = 8;
  constructor(path, oid, stat) {
    const mode = isExec(stat)
      ? IndexEntry.EXECUTABLE_MODE
      : IndexEntry.REGULAR_MODE;
    const flags = Math.min(stat.size, IndexEntry.MAX_PATH_SIZE);
    this.ctime = new Date(stat.ctime).getTime();
    this.mTime = new Date(stat.mtime).getTime();
    this.dev = stat.dev;
    this.ino = stat.ino;
    this.mode = mode;
    this.uid = stat.uid;
    this.gid = stat.gid;
    this.size = stat.size;
    this.oid = oid;
    this.flag = flags;
    this.path = path;
  }
  toString() {
    const vals = Object.values(this);
    const totalSize = 80 + vals[vals.length - 1].length;
    const paddingSize =
      IndexEntry.ENTRY_BLOCK - (totalSize % IndexEntry.ENTRY_BLOCK);
    const buffer = Buffer.alloc(totalSize + paddingSize);
    bufferpack.packTo(IndexEntry.ENTRY_FORMAT, buffer, 0, vals);
    const string = buffer.toString("hex");
    /*
      Added extra 4 bytes header field for size (It is not there in the original git implmentation)
    */
    const headerBuffer = Buffer.alloc(4);
    bufferpack.packTo("I", headerBuffer, 0, [totalSize + paddingSize]);
    return headerBuffer.toString("hex") + string;
  }
}

export class Index {
  HEADER_SIZE = 20;
  SIGNATURE = "DIRC";
  HEADER_FORMAT = "12sII";
  VERSION = 2;
  ENTRY_BLOCK = 8;
  ENTRY_FORMAT = "8I40sHS";
  constructor(path) {
    this.entries = new Map();
    this.path = path;
  }
  reset() {
    this.entries = new Map();
    this.digest = sha1.create();
    this.changed = false;
  }
  add(path, oid, stat) {
    const entry = new IndexEntry(path, oid, stat);
    this.entries.set(path, entry);
  }
  remove(path) {
    this.entries.delete(path);
  }
  async writeUpdates() {
    try {
      await fs.remove(this.path);
      this.digest = sha1.create();
      const buffer = Buffer.alloc(this.HEADER_SIZE);
      bufferpack.packTo(this.HEADER_FORMAT, buffer, 0, [
        this.SIGNATURE,
        this.VERSION,
        this.entries.size,
      ]);
      await this.write(buffer.toString("hex"));
      for (let [_, entry] of this.entries) {
        await this.write(entry.toString());
      }
      await this.write(this.digest.hex());
    } catch (error) {
      console.log(error);
    }
  }
  async readHeader() {
    try {
      const fd = await fs.open(this.path, "r");
      const buffer = Buffer.alloc(2 * this.HEADER_SIZE); //don't know why do we need to multiply it by 2!
      await fs.read(fd, buffer, 0, 2 * this.HEADER_SIZE, 0);
      await fs.close(fd);
      const header = bufferpack.unpack(
        this.HEADER_FORMAT,
        Buffer.from(buffer.toString("utf8"), "hex"),
        0
      );
      return header;
    } catch (error) {
      console.log(error);
    }
  }

  async readEntries(count) {
    let startByte = 2 * this.HEADER_SIZE;
    try {
      const fd = await fs.open(this.path, "r");
      for (let i = 0; i < count; i++) {
        let buffer = Buffer.alloc(8);
        await fs.read(fd, buffer, 0, 8, startByte);
        const totalSize = bufferpack.unpack(
          "I",
          Buffer.from(buffer.toString("utf8"), "hex"),
          0
        )[0];
        buffer = Buffer.alloc(2 * totalSize);
        startByte += 8;
        await fs.read(fd, buffer, 0, 2 * totalSize, startByte);
        const data = bufferpack.unpack(
          IndexEntry.ENTRY_FORMAT,
          Buffer.from(buffer.toString("utf8"), "hex"),
          0
        );
        startByte += 2 * totalSize;
        const path = data[10];
        const oid = data[8];
        const stat = {
          ctime: data[0],
          mtime: data[1],
          dev: data[2],
          ino: data[3],
          mode: data[4],
          uid: data[5],
          gid: data[6],
          size: data[7],
        };
        this.add(path, oid, stat);
      }
      await fs.close(fd);
    } catch (error) {
      console.log(error);
    }
  }
  async loadForUpdate() {
    try {
      this.reset();
      const doesIndexExists = await fs.exists(this.path);
      if (!doesIndexExists) return;
      const [signature, version, count] = await this.readHeader();
      await this.readEntries(count);
    } catch (error) {
      console.log(error);
    }
  }
  async write(data) {
    try {
      await fs.appendFile(this.path, data);
      this.digest?.update(data);
    } catch (error) {
      console.log(error);
    }
  }
}
