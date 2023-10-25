import path from "path";

export class Entry {
  REGULAR_MODE = "100644";
  EXECUTABLE_MODE = "100755";
  constructor(name, oid, isExecutable) {
    this.name = name;
    this.oid = oid;
    this.mode = isExecutable ? this.EXECUTABLE_MODE : this.REGULAR_MODE;
    this.parentDirectories = name.split(path.sep).slice(0, -1);
    this.basename = path.basename(this.name);
  }
}
