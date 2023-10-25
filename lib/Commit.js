export class Commit {
  constructor(parent, tree, author, message) {
    this.tree = tree;
    this.author = author;
    this.message = message;
    this.type = "commit";
    this.oid = null;
    this.parent = parent;
  }
  toString() {
    const lines = [
      `tree ${this.tree}`,
      `author ${this.author}`,
      `committer ${this.author}`,
      `parent ( ${this.parent||"root-commit"} )`,
      this.message,
    ];
    return lines.join("\n");
  }
}
