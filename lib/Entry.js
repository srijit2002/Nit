import path from "path";

export class Entry {
  constructor(name, oid, mode) {
    this.name = name;
    this.oid = oid;
    this.mode = mode;
    this.parentDirectories = name.split(path.sep).slice(0, -1);
    this.basename = path.basename(this.name);
  }
}
