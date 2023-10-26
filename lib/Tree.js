import bufferpack from "bufferpack";
import { Entry } from "./Entry.js";

export class Tree {
  DIRECTORY_MODE = "40000";
  static ENTRY_FORMAT = "SS40s";
  constructor(entries = new Map()) {
    this.oid = null;
    this.entries = entries;
    this.type = "tree";
    this.mode = this.DIRECTORY_MODE;
  }
  toString() {
    const entries = [];
    for (let [name, entry] of this.entries) {
      entries.push(
        bufferpack
          .pack(Tree.ENTRY_FORMAT, [entry.mode, name, entry.oid])
          .toString("hex")
      );
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
  static parse(content) {
    const entries = content.split(" ");
    const children = new Map();
    for (let entry of entries) {
      const data = bufferpack.unpack(
        Tree.ENTRY_FORMAT,
        Buffer.from(entry, "hex"),
        0
      );
      children.set(data[1], new Entry(data[1], data[2], data[0]));
    }
    const tree = new Tree(children);
    return tree;
  }
}
