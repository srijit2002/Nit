import bufferpack from "bufferpack";

export class Tree {
  DIRECTORY_MODE = "40000";
  ENTRY_FORMAT = "S40s";
  constructor() {
    this.oid = null;
    this.entries = new Map();
    this.type = "tree";
    this.mode = this.DIRECTORY_MODE;
  }
  toString() {
    const entries = [];
    for (let [name, entry] of this.entries) {
      entries.push(bufferpack.pack(this.ENTRY_FORMAT,[`${entry.mode} ${name}`, entry.oid]));
    }
    return entries.join(" ");
  }
  static build(entries) {
    const root = new Tree();
    entries.sort((a, b) => a.name.localeCompare(b.name));
    entries.forEach((entry) => {
      root.addEntry(entry.parentDirectories, entry);
    });
    return root;
  }
  addEntry(parents, entry) {
    if (parents.length === 0) {
      this.entries.set(entry.basename, entry);
    } else {
      const parent = parents[0];
      if (!this.entries.has(parent)) {
        this.entries.set(parent, new Tree());
      }
      this.entries.get(parent).addEntry(parents.slice(1), entry);
    }
  }
  traverse(callback = () => {}) {
    for (let [_, entry] of this.entries) {
      if (entry instanceof Tree) {
        entry.traverse(callback);
      }
    }
    callback(this);
  }
}
